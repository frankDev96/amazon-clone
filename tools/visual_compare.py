#!/usr/bin/env python3
"""Compare a Godot screenshot with an approved visual reference.

This tool never writes to the reference path. It writes a normalized actual
image, overlay, diff and machine-readable report into the requested output
directory.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
from pathlib import Path
from typing import Any


def _imports() -> tuple[Any, Any, Any, Any, Any]:
    try:
        import cv2
        import numpy as np
        from PIL import Image
        from skimage.metrics import structural_similarity
    except ImportError as exc:
        raise SystemExit(
            "Visual comparison dependencies are missing. Install "
            "requirements-visual-tests.txt first.\n"
            f"Import error: {exc}"
        ) from exc
    return cv2, np, Image, structural_similarity, hashlib


def _sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def _load_rgb(path: Path, cv2: Any, np: Any) -> Any:
    image = cv2.imread(str(path), cv2.IMREAD_COLOR)
    if image is None:
        raise ValueError(f"Could not decode image: {path}")
    return cv2.cvtColor(image, cv2.COLOR_BGR2RGB)


def _rect(value: Any, name: str) -> tuple[int, int, int, int]:
    if not isinstance(value, list) or len(value) != 4:
        raise ValueError(f"{name} must be [x, y, width, height]")
    result = tuple(int(item) for item in value)
    if result[2] <= 0 or result[3] <= 0:
        raise ValueError(f"{name} width and height must be positive")
    return result


def _crop(image: Any, rect: tuple[int, int, int, int], name: str) -> Any:
    x, y, width, height = rect
    image_height, image_width = image.shape[:2]
    if x < 0 or y < 0 or x + width > image_width or y + height > image_height:
        raise ValueError(
            f"{name} {rect} is outside source image {image_width}x{image_height}"
        )
    return image[y : y + height, x : x + width].copy()


def _normalize(image: Any, rect: tuple[int, int, int, int], size: tuple[int, int], cv2: Any, np: Any) -> tuple[Any, dict[str, Any]]:
    cropped = _crop(image, rect, "actual_rect")
    target_width, target_height = size
    source_height, source_width = cropped.shape[:2]
    source_ratio = source_width / source_height
    target_ratio = target_width / target_height
    if abs(source_ratio - target_ratio) < 0.002:
        output = cv2.resize(cropped, (target_width, target_height), interpolation=cv2.INTER_AREA)
        mode = "aspect_preserving_resize"
    else:
        scale = min(target_width / source_width, target_height / source_height)
        resized_width = max(1, round(source_width * scale))
        resized_height = max(1, round(source_height * scale))
        resized = cv2.resize(cropped, (resized_width, resized_height), interpolation=cv2.INTER_AREA)
        output = np.zeros((target_height, target_width, 3), dtype=np.uint8)
        offset_x = (target_width - resized_width) // 2
        offset_y = (target_height - resized_height) // 2
        output[offset_y : offset_y + resized_height, offset_x : offset_x + resized_width] = resized
        mode = "letterbox_aspect_preserving"
    return output, {
        "source_size": [source_width, source_height],
        "target_size": [target_width, target_height],
        "source_aspect": source_ratio,
        "target_aspect": target_ratio,
        "mode": mode,
    }


def _regions(mask: Any, cv2: Any, np: Any) -> list[dict[str, Any]]:
    kernel = np.ones((7, 7), dtype=np.uint8)
    cleaned = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
    cleaned = cv2.dilate(cleaned, kernel, iterations=1)
    count, _, stats, _ = cv2.connectedComponentsWithStats(cleaned, connectivity=8)
    regions: list[dict[str, Any]] = []
    for index in range(1, count):
        x, y, width, height, area = (int(value) for value in stats[index])
        if area < 200:
            continue
        regions.append({"bbox": [x, y, width, height], "mismatch_pixels": area})
    regions.sort(key=lambda item: int(item["mismatch_pixels"]), reverse=True)
    return regions[:20]


def _node_regions(node_map: dict[str, Any], size: tuple[int, int]) -> list[dict[str, Any]]:
    viewport = node_map.get("viewport", [])
    if not isinstance(viewport, list) or len(viewport) != 2 or not viewport[0] or not viewport[1]:
        return []
    regions = []
    for item in node_map.get("regions", []):
        if not isinstance(item, dict) or len(item.get("rect", [])) != 4:
            continue
        x, y, width, height = (float(value) for value in item["rect"])
        sx = size[0] / float(viewport[0])
        sy = size[1] / float(viewport[1])
        left = max(0, min(size[0], round(x * sx)))
        top = max(0, min(size[1], round(y * sy)))
        right = max(left, min(size[0], round((x + width) * sx)))
        bottom = max(top, min(size[1], round((y + height) * sy)))
        regions.append({
            "semantic": str(item.get("semantic", "unknown")),
            "node_path": str(item.get("node_path", "")),
            "resource_path": str(item.get("resource_path", "")),
            "bbox": [left, top, right - left, bottom - top],
        })
    return regions


def _region_metrics(regions: list[dict[str, Any]], ssim_map: Any, lab_delta: Any, edge_mismatch: Any, mismatch_mask: Any, np: Any) -> list[dict[str, Any]]:
    result = []
    for region in regions:
        x, y, width, height = region["bbox"]
        if width <= 0 or height <= 0:
            continue
        region_ssim = ssim_map[y : y + height, x : x + width]
        region_lab = lab_delta[y : y + height, x : x + width]
        region_edges = edge_mismatch[y : y + height, x : x + width]
        region_mask = mismatch_mask[y : y + height, x : x + width]
        result.append({
            **region,
            "metrics": {
                "ssim": float(region_ssim.mean()),
                "mean_abs_lab_delta": float(region_lab.mean()),
                "p95_abs_lab_delta": float(np.percentile(region_lab, 95)),
                "edge_mismatch_ratio": float(np.count_nonzero(region_edges) / max(region_edges.size, 1)),
                "mismatch_pixel_ratio": float(np.count_nonzero(region_mask) / max(region_mask.size, 1)),
            },
        })
    return result


def _map_mismatch_nodes(mismatches: list[dict[str, Any]], nodes: list[dict[str, Any]]) -> None:
    for mismatch in mismatches:
        x, y, width, height = mismatch["bbox"]
        best_node = None
        best_intersection = 0
        best_node_area = float("inf")
        for node in nodes:
            nx, ny, nw, nh = node["bbox"]
            intersection = max(0, min(x + width, nx + nw) - max(x, nx)) * max(0, min(y + height, ny + nh) - max(y, ny))
            node_area = nw * nh
            if intersection > best_intersection or (intersection > 0 and intersection == best_intersection and node_area < best_node_area):
                best_node = node
                best_intersection = intersection
                best_node_area = node_area
        if best_node is not None:
            mismatch["godot_node"] = {key: best_node[key] for key in ("semantic", "node_path", "resource_path")}


def compare(reference_path: Path, actual_path: Path, output_dir: Path, config: dict[str, Any], node_map: dict[str, Any] | None = None) -> dict[str, Any]:
    cv2, np, Image, structural_similarity, _ = _imports()
    output_dir.mkdir(parents=True, exist_ok=True)
    canonical = tuple(int(value) for value in config["canonical_size"])
    screen = config["screen"]
    normalization = screen["normalization"]
    reference = _load_rgb(reference_path, cv2, np)
    actual_raw = _load_rgb(actual_path, cv2, np)
    reference_rect = _rect(normalization["reference_rect"], "reference_rect")
    actual_rect_value = normalization.get("actual_rect")
    if actual_rect_value is None:
        actual_rect_value = [0, 0, actual_raw.shape[1], actual_raw.shape[0]]
    actual_rect = _rect(actual_rect_value, "actual_rect")
    reference_normalized, reference_meta = _normalize(reference, reference_rect, canonical, cv2, np)
    actual_normalized, actual_meta = _normalize(actual_raw, actual_rect, canonical, cv2, np)

    actual_output = output_dir / "actual.png"
    overlay_output = output_dir / "overlay.png"
    diff_output = output_dir / "diff.png"
    Image.fromarray(actual_normalized).save(actual_output)

    reference_gray = cv2.cvtColor(reference_normalized, cv2.COLOR_RGB2GRAY)
    actual_gray = cv2.cvtColor(actual_normalized, cv2.COLOR_RGB2GRAY)
    ssim, ssim_map = structural_similarity(reference_gray, actual_gray, data_range=255, full=True)
    reference_lab = cv2.cvtColor(reference_normalized, cv2.COLOR_RGB2LAB).astype(np.float32)
    actual_lab = cv2.cvtColor(actual_normalized, cv2.COLOR_RGB2LAB).astype(np.float32)
    lab_delta = np.abs(reference_lab - actual_lab)
    mean_abs_lab_delta = float(lab_delta.mean())
    p95_lab_delta = float(np.percentile(lab_delta, 95))

    reference_edges = cv2.Canny(reference_gray, 80, 160)
    actual_edges = cv2.Canny(actual_gray, 80, 160)
    edge_mismatch = cv2.bitwise_xor(reference_edges, actual_edges)
    edge_mismatch_ratio = float(np.count_nonzero(edge_mismatch) / edge_mismatch.size)
    ssim_error = np.clip((1.0 - ssim_map) * 255.0, 0, 255).astype(np.uint8)
    color_error = np.clip(lab_delta.mean(axis=2), 0, 255).astype(np.uint8)
    combined_error = np.maximum(ssim_error, color_error)
    _, mismatch_mask = cv2.threshold(combined_error, 32, 255, cv2.THRESH_BINARY)
    regions = _regions(mismatch_mask, cv2, np)
    nodes = _node_regions(node_map or {}, canonical)
    _map_mismatch_nodes(regions, nodes)
    region_metrics = _region_metrics(nodes, ssim_map, lab_delta, edge_mismatch, mismatch_mask, np)

    overlay = cv2.addWeighted(reference_normalized, 0.5, actual_normalized, 0.5, 0.0)
    diff = np.zeros_like(actual_normalized)
    diff[:, :, 0] = np.clip(combined_error * 2, 0, 255)
    diff[:, :, 1] = np.where(edge_mismatch > 0, 255, 0).astype(np.uint8)
    diff[:, :, 2] = np.clip(color_error * 2, 0, 255)
    Image.fromarray(overlay).save(overlay_output)
    Image.fromarray(diff).save(diff_output)

    thresholds = screen.get("thresholds", {})
    approval = str(thresholds.get("approval", "missing"))
    region_thresholds = screen.get("region_thresholds", {})
    region_checks: dict[str, Any] = {}
    mapped_semantics = {region["semantic"] for region in region_metrics}
    missing_region_maps = sorted(set(region_thresholds) - mapped_semantics)
    all_regions_calibrated = bool(region_thresholds) and bool(region_metrics) and not missing_region_maps
    for semantic in missing_region_maps:
        region_checks[semantic] = {"approval": "missing_node_map", "passed": False}
    for region in region_metrics:
        region_policy = region_thresholds.get(region["semantic"])
        if not isinstance(region_policy, dict):
            all_regions_calibrated = False
            region_checks[region["semantic"]] = {"approval": "missing", "passed": False}
            continue
        region_values = region["metrics"]
        required_region_metrics = (
            "ssim_min",
            "mean_abs_lab_delta_max",
            "edge_mismatch_ratio_max",
        )
        region_calibrated = all(region_policy.get(key) is not None for key in required_region_metrics)
        checks = {
            "ssim": region_policy.get("ssim_min") is None or region_values["ssim"] >= float(region_policy["ssim_min"]),
            "mean_abs_lab_delta": region_policy.get("mean_abs_lab_delta_max") is None or region_values["mean_abs_lab_delta"] <= float(region_policy["mean_abs_lab_delta_max"]),
            "edge_mismatch_ratio": region_policy.get("edge_mismatch_ratio_max") is None or region_values["edge_mismatch_ratio"] <= float(region_policy["edge_mismatch_ratio_max"]),
        }
        region_approval = str(region_policy.get("approval", "provisional"))
        if region_approval != "approved":
            all_regions_calibrated = False
        if not region_calibrated:
            all_regions_calibrated = False
        region_checks[region["semantic"]] = {
            "approval": region_approval,
            "calibrated": region_calibrated,
            "checks": checks,
            "passed": all(checks.values()),
        }
    passed_metrics = (
        float(ssim) >= float(thresholds.get("ssim_min", 1.0))
        and mean_abs_lab_delta <= float(thresholds.get("mean_abs_lab_delta_max", 0.0))
        and edge_mismatch_ratio <= float(thresholds.get("edge_mismatch_ratio_max", 0.0))
        and all(item["passed"] for item in region_checks.values())
    )
    status = "passed" if approval == "approved" and all_regions_calibrated and passed_metrics else "failed"
    if approval != "approved" or not all_regions_calibrated:
        status = "unresolved_thresholds"

    report = {
        "version": 1,
        "status": status,
        "screen": config.get("screen_name", "unknown"),
        "reference": {"path": str(reference_path), "sha256": _sha256(reference_path)},
        "actual": {"path": str(actual_path), "sha256": _sha256(actual_path)},
        "outputs": {
            "actual": str(actual_output),
            "overlay": str(overlay_output),
            "diff": str(diff_output),
            "report": str(output_dir / "report.json"),
            "metrics": str(output_dir / "metrics.json"),
        },
        "normalization": {
            "canonical_size": list(canonical),
            "reference": reference_meta,
            "actual": actual_meta,
            "config": normalization,
        },
        "metrics": {
            "ssim": float(ssim),
            "mean_abs_lab_delta": mean_abs_lab_delta,
            "p95_lab_delta": p95_lab_delta,
            "edge_mismatch_ratio": edge_mismatch_ratio,
            "mismatch_pixel_ratio": float(np.count_nonzero(mismatch_mask) / mismatch_mask.size),
        },
        "regions": region_metrics,
        "region_checks": region_checks,
        "missing_region_maps": missing_region_maps,
        "thresholds": thresholds,
        "mismatches": {
            "layout": {"edge_mismatch_ratio": edge_mismatch_ratio},
            "color": {"mean_abs_lab_delta": mean_abs_lab_delta, "p95_lab_delta": p95_lab_delta},
            "structural": {"ssim": float(ssim), "regions": regions},
        },
    }
    report_path = output_dir / "report.json"
    metrics_path = output_dir / "metrics.json"
    report_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    metrics_path.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    return report


def _self_test() -> int:
    cv2, np, Image, _, _ = _imports()
    import tempfile

    with tempfile.TemporaryDirectory(prefix="water-sort-visual-") as directory:
        root = Path(directory)
        reference = root / "reference.png"
        actual = root / "actual.png"
        pixels = np.zeros((64, 64, 3), dtype=np.uint8)
        pixels[:, :, :] = [12, 50, 80]
        pixels[16:48, 16:48] = [20, 200, 220]
        Image.fromarray(pixels).save(reference)
        Image.fromarray(pixels.copy()).save(actual)
        config = {
            "canonical_size": [64, 64],
            "screen_name": "self_test",
            "screen": {
                "normalization": {
                    "reference_rect": [0, 0, 64, 64],
                    "actual_rect": [0, 0, 64, 64],
                },
                "thresholds": {
                    "approval": "approved",
                    "ssim_min": 0.99,
                    "mean_abs_lab_delta_max": 0.1,
                    "edge_mismatch_ratio_max": 0.01,
                },
                "region_thresholds": {
                    "self_test": {
                        "approval": "approved",
                        "ssim_min": 0.99,
                        "mean_abs_lab_delta_max": 0.1,
                        "edge_mismatch_ratio_max": 0.01,
                    }
                },
            },
        }
        node_map = {
            "viewport": [64, 64],
            "regions": [{"semantic": "self_test", "node_path": "/root/Test", "rect": [0, 0, 64, 64]}],
        }
        report = compare(reference, actual, root / "out", config, node_map)
        if report["status"] != "passed":
            print(json.dumps(report, indent=2))
            return 1
        print("visual_compare self-test: passed")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--reference", type=Path)
    parser.add_argument("--actual", type=Path)
    parser.add_argument("--config", type=Path)
    parser.add_argument("--screen", default="main_menu")
    parser.add_argument("--output", type=Path)
    parser.add_argument("--node-map", type=Path)
    parser.add_argument("--self-test", action="store_true")
    args = parser.parse_args()
    if args.self_test:
        return _self_test()
    if not all([args.reference, args.actual, args.config, args.output]):
        parser.error("--reference, --actual, --config and --output are required")
    config_root = json.loads(args.config.read_text(encoding="utf-8"))
    screen = config_root.get("screens", {}).get(args.screen)
    if not isinstance(screen, dict):
        raise SystemExit(f"Screen is not configured: {args.screen}")
    config = {
        "canonical_size": config_root["canonical_size"],
        "screen_name": args.screen,
        "screen": screen,
    }
    node_map = json.loads(args.node_map.read_text(encoding="utf-8")) if args.node_map else {}
    report = compare(args.reference, args.actual, args.output, config, node_map)
    print(json.dumps(report, indent=2))
    return 0 if report["status"] == "passed" else 2


if __name__ == "__main__":
    sys.exit(main())

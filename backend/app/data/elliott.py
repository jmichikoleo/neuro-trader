"""Elliott Wave detection — pragmatic heuristic.

Approach:
1. Find swing pivots from a price series using a percentage zigzag.
2. Take the last 6 pivots (which form a candidate 5-wave impulse: P0..P5).
3. Validate the three core Elliott Wave rules:
     R1: Wave 2 cannot retrace more than 100% of Wave 1
     R2: Wave 3 is never the shortest of waves 1, 3, 5
     R3: Wave 4 cannot enter the price territory of Wave 1
4. Heuristically label where price currently sits in the structure.

This is intentionally simple (Elliott labelling is famously subjective) — it
gives the LLM agent something concrete to reason about, not a tradeable signal.
"""
from __future__ import annotations
from typing import Any, Dict, List, Tuple
import pandas as pd


def find_pivots(closes: List[float], threshold_pct: float = 5.0) -> List[Tuple[int, float, str]]:
    """Percentage-based zigzag pivot detector.
    Returns list of (index, price, kind) where kind is 'H' (high) or 'L' (low),
    alternating."""
    if len(closes) < 3:
        return []
    pivots: List[Tuple[int, float, str]] = []
    threshold = threshold_pct / 100.0

    # initial direction
    last_pivot_idx = 0
    last_pivot_price = closes[0]
    direction: str | None = None  # 'up' or 'down'

    for i in range(1, len(closes)):
        price = closes[i]
        change = (price - last_pivot_price) / last_pivot_price

        if direction is None:
            if change >= threshold:
                direction = "up"
            elif change <= -threshold:
                direction = "down"
                pivots.append((last_pivot_idx, last_pivot_price, "H"))
                last_pivot_idx, last_pivot_price = i, price
                continue
            if direction == "up":
                pivots.append((last_pivot_idx, last_pivot_price, "L"))
                last_pivot_idx, last_pivot_price = i, price
            continue

        if direction == "up":
            if price > last_pivot_price:
                last_pivot_idx, last_pivot_price = i, price
            elif (last_pivot_price - price) / last_pivot_price >= threshold:
                pivots.append((last_pivot_idx, last_pivot_price, "H"))
                direction = "down"
                last_pivot_idx, last_pivot_price = i, price
        else:  # direction == 'down'
            if price < last_pivot_price:
                last_pivot_idx, last_pivot_price = i, price
            elif (price - last_pivot_price) / last_pivot_price >= threshold:
                pivots.append((last_pivot_idx, last_pivot_price, "L"))
                direction = "up"
                last_pivot_idx, last_pivot_price = i, price

    # close out the final pivot
    pivots.append((last_pivot_idx, last_pivot_price, "H" if direction == "up" else "L"))
    return pivots


def label_impulse(pivots: List[Tuple[int, float, str]], dates: List[str] | None = None) -> Dict[str, Any]:
    """Take the most recent pivots and try to label them as a 5-wave impulse.
    Need 6 pivots: P0 (start) → P1=W1 top → P2=W2 bottom → P3=W3 top → P4=W4 bottom → P5=W5 top.
    Or the inverted (bearish) version."""
    if len(pivots) < 6:
        return {"status": "insufficient_pivots", "count": len(pivots)}

    last6 = pivots[-6:]
    p0, p1, p2, p3, p4, p5 = last6
    kinds = "".join(p[2] for p in last6)

    if kinds == "LHLHLH":
        direction = "bullish"
    elif kinds == "HLHLHL":
        direction = "bearish"
    else:
        return {
            "status": "no_clean_impulse",
            "pattern": kinds,
            "note": "last 6 pivots do not form an alternating 5-wave impulse",
        }

    sign = 1 if direction == "bullish" else -1
    w1 = sign * (p1[1] - p0[1])
    w2 = sign * (p1[1] - p2[1])  # retrace magnitude
    w3 = sign * (p3[1] - p2[1])
    w4 = sign * (p3[1] - p4[1])  # retrace magnitude
    w5 = sign * (p5[1] - p4[1])

    rules: Dict[str, Any] = {}

    # Rule 1: Wave 2 retrace < 100% of Wave 1
    w2_retrace_pct = (w2 / w1) if w1 > 0 else None
    rules["rule_1_w2_retrace_lt_100"] = {
        "passed": (w2_retrace_pct is not None and w2_retrace_pct < 1.0),
        "value": round(w2_retrace_pct, 3) if w2_retrace_pct is not None else None,
        "desc": "wave 2 must not retrace more than 100% of wave 1",
    }

    # Rule 2: Wave 3 not the shortest of (W1, W3, W5)
    rules["rule_2_w3_not_shortest"] = {
        "passed": (w3 > min(w1, w5) or (w3 >= w1 and w3 >= w5)),
        "lengths": {"w1": round(w1, 2), "w3": round(w3, 2), "w5": round(w5, 2)},
        "desc": "wave 3 is never the shortest of waves 1/3/5",
    }

    # Rule 3: Wave 4 doesn't overlap wave 1 territory
    if direction == "bullish":
        w4_low = p4[1]
        w1_high = p1[1]
        rule3_pass = w4_low > w1_high
    else:
        w4_high = p4[1]
        w1_low = p1[1]
        rule3_pass = w4_high < w1_low
    rules["rule_3_w4_no_overlap_w1"] = {
        "passed": bool(rule3_pass),
        "w1_extreme": round(p1[1], 2),
        "w4_extreme": round(p4[1], 2),
        "desc": "wave 4 cannot enter the price territory of wave 1",
    }

    # Fibonacci context for wave 3
    fib_w3_vs_w1 = round(w3 / w1, 2) if w1 > 0 else None

    all_passed = all(r["passed"] for r in rules.values())
    return {
        "status": "labeled",
        "direction": direction,
        "valid": all_passed,
        "pivots": [
            {
                "label": lbl,
                "idx": p[0],
                "price": round(p[1], 2),
                "date": dates[p[0]] if dates and p[0] < len(dates) else None,
            }
            for lbl, p in zip(["P0", "W1", "W2", "W3", "W4", "W5"], last6)
        ],
        "wave_lengths": {
            "w1": round(w1, 2),
            "w2_retrace": round(w2, 2),
            "w3": round(w3, 2),
            "w4_retrace": round(w4, 2),
            "w5": round(w5, 2),
        },
        "fib_w3_over_w1": fib_w3_vs_w1,
        "rules": rules,
        "interpretation": _interpret(direction, all_passed, fib_w3_vs_w1),
    }


def _interpret(direction: str, valid: bool, fib_w3: float | None) -> str:
    if not valid:
        return f"a possible {direction} 5-wave structure is forming, but at least one Elliott rule is violated — count is suspect"
    extension = ""
    if fib_w3 is not None:
        if fib_w3 >= 1.618:
            extension = f" — wave 3 extended ({fib_w3}x wave 1)"
        elif fib_w3 >= 1.0:
            extension = f" — wave 3 = {fib_w3}x wave 1"
    base = (
        "completed a valid bullish 5-wave impulse — expect a 3-wave A-B-C correction next"
        if direction == "bullish"
        else "completed a valid bearish 5-wave impulse — expect a 3-wave corrective bounce next"
    )
    return base + extension


def detect_elliott(
    closes: List[float],
    threshold_pct: float = 5.0,
    dates: List[str] | None = None,
) -> Dict[str, Any]:
    pivots = find_pivots(closes, threshold_pct=threshold_pct)
    label = label_impulse(pivots, dates=dates)
    return {
        "threshold_pct": threshold_pct,
        "pivot_count": len(pivots),
        "pivots_tail": [
            {
                "idx": p[0],
                "price": round(p[1], 2),
                "kind": p[2],
                "date": dates[p[0]] if dates and p[0] < len(dates) else None,
            }
            for p in pivots[-8:]
        ],
        "impulse": label,
    }

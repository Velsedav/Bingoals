import type { Objective, Subobjective } from "../db";
import { clamp01 } from "./format";

export function computeObjectivePercent(obj: Objective, subs: Subobjective[]) {
  const target = obj.goal_target ?? 0;
  if (!target || target <= 0) return null;

  if (obj.goal_kind === "count") {
    // Each subobjective contributes its completion ratio; missing ones count as 0.
    const ratios = subs.map((s) => {
      const total = s.target_total ?? 0;
      if (total > 0) return clamp01((s.progress_current ?? 0) / total);
      return s.is_done ? 1 : 0;
    });
    const sum = ratios.reduce((a, b) => a + b, 0);
    return clamp01(sum / target);
  }

  // metric/amount/manual = objective-level current_value / goal_target
  return clamp01((obj.current_value ?? 0) / target);
}

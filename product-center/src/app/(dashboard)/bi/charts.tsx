"use client";
import ReactECharts from "echarts-for-react";

interface StageStat { stage: string; label: string; count: number }
interface TaskStat { total: number; done: number; inProgress: number; blocked: number }

export function BiCharts({ stageCounts, taskStats }: { stageCounts: StageStat[]; taskStats: TaskStat }) {
  const funnelOption = {
    title: { text: "出品流程漏斗", left: "center", textStyle: { fontSize: 14, fontWeight: 500 } },
    tooltip: { trigger: "item", formatter: "{b}: {c} 个" },
    series: [{
      type: "funnel",
      left: "10%",
      right: "10%",
      top: 40,
      bottom: 20,
      width: "80%",
      min: 0,
      minSize: "5%",
      maxSize: "100%",
      sort: "none",
      gap: 4,
      label: { show: true, position: "inside", formatter: "{b}\n{c}个" },
      data: stageCounts.map(s => ({ name: s.label, value: s.count })),
    }],
  };

  const taskOption = {
    title: { text: "任务状态分布", left: "center", textStyle: { fontSize: 14, fontWeight: 500 } },
    tooltip: { trigger: "item" },
    legend: { bottom: 10 },
    series: [{
      type: "pie",
      radius: ["40%", "70%"],
      avoidLabelOverlap: true,
      data: [
        { value: taskStats.done, name: "已完成", itemStyle: { color: "#22c55e" } },
        { value: taskStats.inProgress, name: "进行中", itemStyle: { color: "#3b82f6" } },
        { value: taskStats.blocked, name: "受阻", itemStyle: { color: "#ef4444" } },
        { value: taskStats.total - taskStats.done - taskStats.inProgress - taskStats.blocked, name: "待处理", itemStyle: { color: "#e5e7eb" } },
      ],
      label: { show: false },
    }],
  };

  const barOption = {
    title: { text: "各阶段产品数量", left: "center", textStyle: { fontSize: 14, fontWeight: 500 } },
    tooltip: { trigger: "axis" },
    xAxis: { type: "category", data: stageCounts.map(s => s.label), axisLabel: { fontSize: 11 } },
    yAxis: { type: "value", minInterval: 1 },
    series: [{
      type: "bar",
      data: stageCounts.map(s => s.count),
      itemStyle: { borderRadius: [4, 4, 0, 0], color: "#0ea5e9" },
    }],
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <ReactECharts option={funnelOption} style={{ height: 320 }} />
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-4">
        <ReactECharts option={taskOption} style={{ height: 320 }} />
      </div>
      <div className="bg-white rounded-xl border border-neutral-200 p-4 md:col-span-2">
        <ReactECharts option={barOption} style={{ height: 240 }} />
      </div>
    </div>
  );
}

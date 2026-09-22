import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  KanbanTask,
  WorkspaceUser,
} from '../types';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieIcon,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Building2,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Crown,
  Users,
} from 'lucide-react';

interface ExecutiveAnalyticsWidgetProps {
  tasks: KanbanTask[];
  teamMembers: WorkspaceUser[];
  userRole: 'admin' | 'hr';
  userName: string;
}

export interface DepartmentMetric {
  department: string;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  inReviewTasks: number;
  toDoTasks: number;
  backlogTasks: number;
  urgentTasks: number;
  completionRate: number;
  headcount: number;
  members: WorkspaceUser[];
}

const DEPARTMENT_COLORS: Record<string, string> = {
  'Engineering': '#3b82f6', // blue
  'Product Design': '#8b5cf6', // purple
  'Human Resources': '#10b981', // emerald
  'Executive Leadership': '#f59e0b', // amber
  'General Operations': '#64748b', // slate
};

const STATUS_COLORS = {
  Done: '#10b981', // emerald-500
  'In Progress': '#3b82f6', // blue-500
  'In Review': '#f59e0b', // amber-500
  'To Do': '#8b5cf6', // violet-500
  Backlog: '#94a3b8', // slate-400
};

export const ExecutiveAnalyticsWidget: React.FC<ExecutiveAnalyticsWidgetProps> = ({
  tasks,
  teamMembers,
  userRole,
  userName,
}) => {
  const [activeTab, setActiveTab] = useState<'workload' | 'completion' | 'breakdown'>('workload');
  const [selectedDeptFilter, setSelectedDeptFilter] = useState<string>('all');

  // Compute department metrics dynamically
  const departmentMetrics: DepartmentMetric[] = useMemo(() => {
    // Collect all departments from team members
    const deptMap: Record<string, { members: WorkspaceUser[]; tasks: KanbanTask[] }> = {};

    teamMembers.forEach((m) => {
      const dept = m.department || 'General Operations';
      if (!deptMap[dept]) {
        deptMap[dept] = { members: [], tasks: [] };
      }
      deptMap[dept].members.push(m);
    });

    // Make sure basic departments exist
    const defaultDepts = ['Engineering', 'Product Design', 'Human Resources', 'Executive Leadership'];
    defaultDepts.forEach((d) => {
      if (!deptMap[d]) {
        deptMap[d] = { members: [], tasks: [] };
      }
    });

    // Map each task to a department
    tasks.forEach((task) => {
      let matchedDept: string | null = null;

      // 1. Match by assignee
      if (task.assignee) {
        const foundMember = teamMembers.find(
          (m) =>
            m.id === task.assignee?.id ||
            m.email.toLowerCase() === task.assignee?.email?.toLowerCase() ||
            m.name.toLowerCase() === task.assignee?.name?.toLowerCase()
        );
        if (foundMember) {
          matchedDept = foundMember.department;
        }
      }

      // 2. Fallback match by tags or titles
      if (!matchedDept) {
        const tagsJoined = (task.tags || []).join(' ').toLowerCase();
        const titleLower = (task.title || '').toLowerCase();
        if (
          tagsJoined.includes('devops') ||
          tagsJoined.includes('backend') ||
          tagsJoined.includes('frontend') ||
          titleLower.includes('api') ||
          titleLower.includes('server') ||
          titleLower.includes('oauth')
        ) {
          matchedDept = 'Engineering';
        } else if (
          tagsJoined.includes('design') ||
          tagsJoined.includes('token') ||
          titleLower.includes('ui') ||
          titleLower.includes('figma')
        ) {
          matchedDept = 'Product Design';
        } else if (
          tagsJoined.includes('hr') ||
          tagsJoined.includes('facilities') ||
          tagsJoined.includes('culture') ||
          tagsJoined.includes('events')
        ) {
          matchedDept = 'Human Resources';
        } else if (
          tagsJoined.includes('strategy') ||
          tagsJoined.includes('leadership') ||
          tagsJoined.includes('audit')
        ) {
          matchedDept = 'Executive Leadership';
        } else {
          matchedDept = 'General Operations';
        }
      }

      if (!deptMap[matchedDept]) {
        deptMap[matchedDept] = { members: [], tasks: [] };
      }
      deptMap[matchedDept].tasks.push(task);
    });

    return Object.entries(deptMap).map(([deptName, data]) => {
      const total = data.tasks.length;
      const done = data.tasks.filter((t) => t.status === 'Done').length;
      const inProgress = data.tasks.filter((t) => t.status === 'In Progress').length;
      const inReview = data.tasks.filter((t) => t.status === 'In Review').length;
      const toDo = data.tasks.filter((t) => t.status === 'To Do').length;
      const backlog = data.tasks.filter((t) => t.status === 'Backlog').length;
      const urgent = data.tasks.filter((t) => t.priority === 'Urgent').length;
      const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

      return {
        department: deptName,
        totalTasks: total,
        completedTasks: done,
        inProgressTasks: inProgress,
        inReviewTasks: inReview,
        toDoTasks: toDo,
        backlogTasks: backlog,
        urgentTasks: urgent,
        completionRate,
        headcount: data.members.length,
        members: data.members,
      };
    });
  }, [tasks, teamMembers]);

  // Overall KPI aggregations
  const totalTasksCount = tasks.length;
  const totalDoneCount = tasks.filter((t) => t.status === 'Done').length;
  const overallCompletionRate =
    totalTasksCount > 0 ? Math.round((totalDoneCount / totalTasksCount) * 100) : 0;
  const totalActiveDeliverables = tasks.filter(
    (t) => t.status === 'In Progress' || t.status === 'In Review'
  ).length;
  const totalUrgentCount = tasks.filter((t) => t.priority === 'Urgent').length;

  // Best performing department
  const topDepartment = useMemo(() => {
    const sorted = [...departmentMetrics]
      .filter((d) => d.totalTasks > 0)
      .sort((a, b) => b.completionRate - a.completionRate);
    return sorted[0] || null;
  }, [departmentMetrics]);

  // Data formatted for Recharts BarChart (Workload by Department)
  const workloadChartData = useMemo(() => {
    return departmentMetrics
      .filter((d) => selectedDeptFilter === 'all' || d.department === selectedDeptFilter)
      .map((d) => ({
        name: d.department,
        'Completed (Done)': d.completedTasks,
        'In Progress': d.inProgressTasks,
        'In Review': d.inReviewTasks,
        'To Do / Backlog': d.toDoTasks + d.backlogTasks,
        total: d.totalTasks,
        completionRate: d.completionRate,
      }));
  }, [departmentMetrics, selectedDeptFilter]);

  // Data formatted for Completion Rate BarChart
  const completionChartData = useMemo(() => {
    return departmentMetrics
      .filter((d) => selectedDeptFilter === 'all' || d.department === selectedDeptFilter)
      .map((d) => ({
        name: d.department,
        completionRate: d.completionRate,
        completed: d.completedTasks,
        total: d.totalTasks,
      }));
  }, [departmentMetrics, selectedDeptFilter]);

  // Data formatted for Donut Chart (Status distribution)
  const statusPieData = useMemo(() => {
    const filteredTasks =
      selectedDeptFilter === 'all'
        ? tasks
        : tasks.filter((t) => {
            const member = teamMembers.find(
              (m) =>
                m.id === t.assignee?.id ||
                m.email.toLowerCase() === t.assignee?.email?.toLowerCase()
            );
            return member?.department === selectedDeptFilter;
          });

    const counts: Record<string, number> = {
      Done: 0,
      'In Progress': 0,
      'In Review': 0,
      'To Do': 0,
      Backlog: 0,
    };

    filteredTasks.forEach((t) => {
      if (counts[t.status] !== undefined) {
        counts[t.status]++;
      } else {
        counts['To Do']++;
      }
    });

    return Object.entries(counts)
      .filter(([_, value]) => value > 0)
      .map(([name, value]) => ({
        name,
        value,
        color: STATUS_COLORS[name as keyof typeof STATUS_COLORS] || '#94a3b8',
      }));
  }, [tasks, selectedDeptFilter, teamMembers]);

  // Custom Recharts Tooltip
  const CustomBarTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-stone-900 border border-stone-700 text-white p-3 rounded-xl shadow-xl text-xs space-y-1.5 z-50">
          <div className="font-bold border-b border-stone-700 pb-1 text-stone-200">
            {label}
          </div>
          {payload.map((entry: any, index: number) => (
            <div key={`item-${index}`} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-stone-300">
                <span
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: entry.color || entry.fill }}
                />
                {entry.name}:
              </span>
              <span className="font-semibold text-white">
                {entry.value}
                {entry.name.toLowerCase().includes('rate') ? '%' : ' tasks'}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const CustomPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percent = totalTasksCount > 0 ? Math.round((data.value / totalTasksCount) * 100) : 0;
      return (
        <div className="bg-stone-900 border border-stone-700 text-white p-2.5 rounded-xl shadow-xl text-xs space-y-1">
          <div className="font-bold flex items-center gap-1.5 text-stone-200">
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: data.payload.color }}
            />
            {data.name}
          </div>
          <div className="text-stone-300">
            <span className="font-bold text-white text-sm">{data.value}</span> tasks ({percent}%)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      id="executive-analytics-widget"
      className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-2xs space-y-5"
    >
      {/* Widget Header with Role Context */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-stone-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span
              className={`p-1.5 rounded-lg ${
                userRole === 'admin'
                  ? 'bg-purple-100 text-purple-700'
                  : 'bg-blue-100 text-blue-700'
              }`}
            >
              {userRole === 'admin' ? (
                <Crown className="w-4 h-4 text-purple-700" />
              ) : (
                <ShieldCheck className="w-4 h-4 text-blue-700" />
              )}
            </span>
            <h2 className="text-base font-bold text-stone-900 tracking-tight flex items-center gap-2">
              <span>Department Workload & Task Completion Analytics</span>
            </h2>
            <span className="text-[11px] font-semibold bg-stone-100 text-stone-700 px-2 py-0.5 rounded-md border border-stone-200">
              {userRole === 'admin' ? 'CEO Executive View' : 'HR Management View'}
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Real-time Recharts data visualization tracking completion ratios, task allocation, and operational capacity across departments.
          </p>
        </div>

        {/* Controls: Department Filter & Visualization Tab Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Department Filter */}
          <div className="flex items-center gap-1.5 text-xs bg-stone-50 border border-stone-200 px-2.5 py-1 rounded-lg">
            <Building2 className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedDeptFilter}
              onChange={(e) => setSelectedDeptFilter(e.target.value)}
              className="bg-transparent text-stone-800 font-medium focus:outline-none cursor-pointer"
            >
              <option value="all">All Departments</option>
              {departmentMetrics.map((d) => (
                <option key={d.department} value={d.department}>
                  {d.department} ({d.totalTasks})
                </option>
              ))}
            </select>
          </div>

          {/* Visualization Modes */}
          <div className="flex items-center bg-stone-100 p-0.5 rounded-lg text-xs font-semibold">
            <button
              onClick={() => setActiveTab('workload')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'workload'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
              <span>Workload</span>
            </button>
            <button
              onClick={() => setActiveTab('completion')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'completion'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              <span>Completion %</span>
            </button>
            <button
              onClick={() => setActiveTab('breakdown')}
              className={`px-3 py-1 rounded-md transition-all flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'breakdown'
                  ? 'bg-white text-stone-900 shadow-2xs font-bold'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <PieIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Status Ratio</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Overall Completion</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-stone-900">{overallCompletionRate}%</span>
            <span className="text-[11px] text-stone-500">
              {totalDoneCount}/{totalTasksCount} done
            </span>
          </div>
          <div className="w-full bg-stone-200 h-1.5 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${overallCompletionRate}%` }}
            />
          </div>
        </div>

        <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Active Deliverables</span>
            <Clock className="w-3.5 h-3.5 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-900">{totalActiveDeliverables}</span>
            <span className="text-[11px] text-stone-500">In Progress / Review</span>
          </div>
          <span className="text-[10px] text-stone-400 block">Requiring staff bandwidth</span>
        </div>

        <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Top Velocity Dept</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-purple-600" />
          </div>
          <div className="truncate">
            <span className="text-base font-bold text-stone-900 block truncate">
              {topDepartment ? topDepartment.department : 'N/A'}
            </span>
            <span className="text-[11px] text-emerald-700 font-semibold">
              {topDepartment ? `${topDepartment.completionRate}% completion rate` : 'No data'}
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-stone-50 border border-stone-200/80 rounded-xl space-y-1">
          <div className="flex items-center justify-between text-[11px] text-stone-500 font-medium">
            <span>Urgent Deliverables</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-600">{totalUrgentCount}</span>
            <span className="text-[11px] text-stone-500">high attention</span>
          </div>
          <span className="text-[10px] text-stone-400 block">Monitored by executives</span>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="p-4 bg-stone-50/70 border border-stone-200 rounded-xl">
        {activeTab === 'workload' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Workload Distribution by Department (Task Statuses)
                </h3>
                <span className="text-[11px] text-stone-500">
                  Stacked breakdown of completed vs in-flight initiatives across company teams.
                </span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={workloadChartData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: '#475569', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }}
                    iconType="circle"
                  />
                  <Bar
                    dataKey="Completed (Done)"
                    stackId="a"
                    fill="#10b981"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="In Progress"
                    stackId="a"
                    fill="#3b82f6"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="In Review"
                    stackId="a"
                    fill="#f59e0b"
                    radius={[0, 0, 0, 0]}
                  />
                  <Bar
                    dataKey="To Do / Backlog"
                    stackId="a"
                    fill="#94a3b8"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'completion' && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Department Task Completion Rates (%)
                </h3>
                <span className="text-[11px] text-stone-500">
                  Calculated as (Done Tasks / Total Tasks Assigned) × 100 per department.
                </span>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={completionChartData}
                  margin={{ top: 15, right: 20, left: -10, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: '#475569', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                    interval={0}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tickFormatter={(val) => `${val}%`}
                    tick={{ fill: '#475569', fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: '#cbd5e1' }}
                  />
                  <Tooltip content={<CustomBarTooltip />} />
                  <Bar
                    dataKey="completionRate"
                    name="Completion Rate (%)"
                    radius={[6, 6, 0, 0]}
                  >
                    {completionChartData.map((entry, index) => {
                      let color = '#3b82f6';
                      if (entry.completionRate >= 60) color = '#10b981'; // high emerald
                      else if (entry.completionRate >= 35) color = '#f59e0b'; // mid amber
                      else color = '#64748b'; // low slate
                      return <Cell key={`cell-${index}`} fill={color} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'breakdown' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
            <div>
              <div className="mb-2">
                <h3 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  Workspace Status Breakdown
                </h3>
                <span className="text-[11px] text-stone-500">
                  {selectedDeptFilter === 'all'
                    ? 'Aggregate distribution of all initiatives across the company'
                    : `Distribution of tasks within ${selectedDeptFilter}`}
                </span>
              </div>

              <div className="space-y-2 mt-4 text-xs">
                {statusPieData.map((item) => {
                  const pct = totalTasksCount > 0 ? Math.round((item.value / totalTasksCount) * 100) : 0;
                  return (
                    <div
                      key={item.name}
                      className="flex items-center justify-between p-2 rounded-lg bg-white border border-stone-200/80"
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <span className="font-semibold text-stone-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-900">{item.value} tasks</span>
                        <span className="text-stone-400 font-mono text-[11px]">({pct}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="h-[250px] w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusPieData.map((entry, index) => (
                      <Cell key={`pie-cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* Department Breakdown Mini-Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-stone-700 uppercase tracking-wider flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5 text-stone-500" />
            <span>Department Capacity & Completion Roster</span>
          </h3>
          <span className="text-[11px] text-stone-500 font-medium">
            {departmentMetrics.length} Departments Managed
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {departmentMetrics.map((dept) => {
            const color = DEPARTMENT_COLORS[dept.department] || '#64748b';
            const rateColor =
              dept.completionRate >= 60
                ? 'text-emerald-700 bg-emerald-50 border-emerald-200'
                : dept.completionRate >= 35
                ? 'text-amber-700 bg-amber-50 border-amber-200'
                : 'text-stone-700 bg-stone-50 border-stone-200';

            return (
              <div
                key={dept.department}
                className="p-3.5 bg-white border border-stone-200 rounded-xl hover:shadow-xs transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-stone-900 block truncate">
                      {dept.department}
                    </span>
                    <span className="text-[11px] text-stone-500 flex items-center gap-1 mt-0.5">
                      <Users className="w-3 h-3 text-stone-400" />
                      {dept.headcount} {dept.headcount === 1 ? 'member' : 'members'}
                    </span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${rateColor}`}
                  >
                    {dept.completionRate}% Done
                  </span>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-stone-100 h-1.5 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${dept.completionRate}%`,
                      backgroundColor: dept.completionRate >= 60 ? '#10b981' : color,
                    }}
                  />
                </div>

                {/* Micro stats */}
                <div className="grid grid-cols-3 gap-1 pt-1 border-t border-stone-100 text-[10px] text-stone-500 text-center">
                  <div>
                    <span className="font-bold text-stone-800 block text-xs">
                      {dept.totalTasks}
                    </span>
                    <span>Total</span>
                  </div>
                  <div>
                    <span className="font-bold text-emerald-700 block text-xs">
                      {dept.completedTasks}
                    </span>
                    <span>Done</span>
                  </div>
                  <div>
                    <span className="font-bold text-blue-700 block text-xs">
                      {dept.inProgressTasks + dept.inReviewTasks}
                    </span>
                    <span>Active</span>
                  </div>
                </div>

                {/* Staff avatars in this dept */}
                {dept.members.length > 0 && (
                  <div className="flex items-center -space-x-1 pt-1">
                    {dept.members.slice(0, 4).map((m) => (
                      <img
                        key={m.id}
                        src={m.avatar}
                        alt={m.name}
                        title={`${m.name} (${m.title})`}
                        className="w-5 h-5 rounded-full ring-1 ring-white object-cover"
                      />
                    ))}
                    {dept.members.length > 4 && (
                      <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 text-[9px] flex items-center justify-center font-bold">
                        +{dept.members.length - 4}
                      </span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

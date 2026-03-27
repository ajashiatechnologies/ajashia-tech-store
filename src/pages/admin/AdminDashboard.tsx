import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";

const COLORS = ["#813FF1", "#22c55e", "#f59e0b", "#ef4444"];

const AdminDashboard = () => {
  const [loading, setLoading] = useState(true);

  const [totalRevenue, setTotalRevenue] = useState(0);
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [pendingOrders, setPendingOrders] = useState(0);

  const [ordersList, setOrdersList] = useState<any[]>([]);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);

  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<any[]>([]);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    fetchAllOrders();
  }, []);

  const fetchAllOrders = async () => {
    const { data: orders, error } = await supabase
      .from("orders")
      .select("id, amount, fulfillment_status, created_at, user_id")
      .order("created_at", { ascending: false });

    if (error || !orders) return;

    const userIds = orders.map((o) => o.user_id).filter(Boolean);

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    const profileMap = new Map(profiles?.map((p) => [p.id, p]) ?? []);

    const merged = orders.map((order) => ({
      ...order,
      profiles: profileMap.get(order.user_id) ?? null,
    }));

    setOrdersList(merged);
  };

  const updateFulfillmentStatus = async (orderId: string, status: string) => {
    try {
      setUpdatingOrder(orderId);

      const { error } = await supabase
        .from("orders")
        .update({ fulfillment_status: status })
        .eq("id", orderId);

      if (error) throw error;

      setOrdersList((prev) =>
        prev.map((o) =>
          o.id === orderId ? { ...o, fulfillment_status: status } : o
        )
      );
    } catch (err) {
      console.error("Update failed:", err);
      alert("Failed to update order status");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const fetchStats = async () => {
    setLoading(true);

    const { data: orders } = await supabase
      .from("orders")
      .select("amount, created_at, fulfillment_status")
      .eq("status", "paid");

    const { count: usersCount } = await supabase
      .from("profiles")
      .select("*", { count: "exact", head: true });

    if (orders) {
      setTotalOrders(orders.length);

      const revenue = orders.reduce((sum, o) => sum + (o.amount || 0), 0);
      setTotalRevenue(revenue);

      const pending = orders.filter(
        (o) => o.fulfillment_status !== "delivered"
      ).length;
      setPendingOrders(pending);

      const revenueMap: Record<string, number> = {};
      orders.forEach((o) => {
        const date = new Date(o.created_at).toLocaleDateString();
        revenueMap[date] = (revenueMap[date] || 0) + o.amount;
      });

      setRevenueData(
        Object.entries(revenueMap).map(([date, total]) => ({ date, total }))
      );

      const statusMap: Record<string, number> = {};
      orders.forEach((o) => {
        const status = o.fulfillment_status || "processing";
        statusMap[status] = (statusMap[status] || 0) + 1;
      });

      setOrderStatusData(
        Object.entries(statusMap).map(([name, value]) => ({ name, value }))
      );
    }

    setTotalUsers(usersCount || 0);
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Loader2 className="w-6 h-6 animate-spin text-[#813FF1]" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 text-white">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">
          Business overview & analytics
        </p>
      </div>

      {/* METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value={`₹${totalRevenue}`} />
        <StatCard title="Total Orders" value={totalOrders} />
        <StatCard title="Total Users" value={totalUsers} />
        <StatCard title="Pending Orders" value={pendingOrders} />
      </div>

      {/* ORDERS MANAGEMENT */}
      <div className="bg-[#0f0f14] border border-[#1f1f2b] rounded-2xl p-6">
        <h3 className="text-xl font-semibold mb-4">Orders Management</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-400 border-b border-[#1f1f2b]">
                <th className="py-3 text-left">Order</th>
                <th className="py-3 text-left">Customer</th>
                <th className="py-3 text-left">Amount</th>
                <th className="py-3 text-left">Status</th>
                <th className="py-3 text-left">Update</th>
                <th className="py-3 text-left">Invoice</th>
              </tr>
            </thead>

            <tbody>
              {ordersList.map((order) => (
                <tr
                  key={order.id}
                  className="border-b border-[#1f1f2b] hover:bg-[#14141d]"
                >
                  <td className="py-3">
                    #{order.id.slice(0, 8)}
                    <p className="text-xs text-gray-500">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </td>

                  <td className="py-3">
                    <p>{order.profiles?.full_name || "Guest"}</p>
                    <p className="text-xs text-gray-500">
                      {order.profiles?.email}
                    </p>
                  </td>

                  <td className="py-3 font-semibold">₹{order.amount}</td>

                  <td className="py-3">
                    <span className="px-3 py-1 rounded-full text-xs bg-[#813FF122] text-[#813FF1]">
                      {order.fulfillment_status}
                    </span>
                  </td>

                  <td className="py-3">
                    <select
                      value={order.fulfillment_status}
                      disabled={updatingOrder === order.id}
                      onChange={(e) =>
                        updateFulfillmentStatus(order.id, e.target.value)
                      }
                      className="
                        bg-[#0f0f14]
                        border border-[#1f1f2b]
                        rounded-lg
                        px-3 py-1
                        text-sm
                        cursor-pointer
                        focus:outline-none
                        focus:ring-2
                        focus:ring-[#813FF1]
                      "
                    >
                      <option value="placed">Placed</option>
                      <option value="packed">Packed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </td>

                  <td className="py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        window.open(
                          `${import.meta.env.VITE_BACKEND_URL}/download-invoice/${order.id}`,
                          "_blank"
                        )
                      }
                      className="
                        px-3 py-1.5
                        text-xs font-medium
                        text-white
                        border border-gray-600
                        rounded-lg
                        bg-transparent
                        hover:border-[#813FF1]
                        hover:text-[#813FF1]
                        transition
                      "
                    >
                      Download Invoice
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <div className="bg-[#0f0f14] border border-[#1f1f2b] rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Revenue Over Time</h3>

          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={revenueData}>
              <XAxis dataKey="date" stroke="#888" />
              <YAxis stroke="#888" />
              <Tooltip
                contentStyle={{
                  background: "#0f0f14",
                  border: "1px solid #813FF1",
                  color: "#fff",
                }}
              />
              <Line
                type="monotone"
                dataKey="total"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Status Chart */}
        <div className="bg-[#0f0f14] border border-[#1f1f2b] rounded-2xl p-6">
          <h3 className="font-semibold mb-4">Order Fulfillment Status</h3>

          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={orderStatusData}
                dataKey="value"
                nameKey="name"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={4}
              >
                {orderStatusData.map((_, index) => (
                  <Cell key={index} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#0f0f14",
                  border: "1px solid #813FF1",
                  color: "#fff",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value }: any) => (
  <div
    className="
      bg-[#0f0f14]
      border border-[#1f1f2b]
      rounded-2xl
      p-5
      transition
      hover:border-[#813FF1]
      hover:shadow-[0_0_20px_#813FF133]
    "
  >
    <p className="text-sm text-gray-400 tracking-wide">{title}</p>
    <p className="text-3xl font-bold mt-2 text-white">{value}</p>
    <div className="mt-3 h-[3px] w-10 rounded-full bg-[#813FF1]" />
  </div>
);

export default AdminDashboard;
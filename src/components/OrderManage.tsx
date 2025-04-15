import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useState } from "react";
import { toast } from "react-toastify";
import Header from "../components/Header";

const API_URL = "https://devapi.uniscore.vn/uri/api/orders";

// Lấy token từ localStorage
const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Fetch Orders
const fetchOrders = async () => {
  const { data } = await axios.get(API_URL, { headers: getAuthHeaders() });
  return data ?? [];
};

type Order = {
  id: number;
  user_id: number;
  name: string;
  address: string;
  total_amount: number;
  status: string;
};

const updateOrderStatus = async ({ orderId, status }: { orderId: number; status: string }) => {
    await axios.put(
      `${API_URL}/${orderId}`,
      { status },
      { headers: getAuthHeaders() }
    );
};


const deleteOrder = async (orderId: number) => {
  await axios.delete(`${API_URL}/${orderId}`, {
    headers: getAuthHeaders(),
  });
};

const OrderManage = () => {
  const queryClient = useQueryClient();
  const [loadingOrderId, setLoadingOrderId] = useState<number | null>(null);

  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
  });

  const mutationUpdate = useMutation({
    mutationFn: updateOrderStatus,
    onMutate: async ({ orderId, status }) => {
      setLoadingOrderId(orderId);
  
      // Lấy dữ liệu cũ từ cache để cập nhật UI ngay lập tức
      await queryClient.cancelQueries({ queryKey: ["orders"] });
  
      const previousOrders = queryClient.getQueryData<Order[]>(["orders"]);
  
      if (previousOrders) {
        queryClient.setQueryData<Order[]>(
          ["orders"],
          previousOrders.map((order) =>
            order.id === orderId ? { ...order, status } : order
          )
        );
      }
  
      return { previousOrders };
    },
    onSuccess: () => {
      toast.success("Order updated successfully", { autoClose: 1500 });
    },
    onError: (_error, _variables, context) => {
      toast.error("Failed to update order");
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
    },
    onSettled: () => {
      setLoadingOrderId(null);
    },
  });  

  const mutationDelete = useMutation({
    mutationFn: deleteOrder,
  
    onMutate: async (orderId) => {
      setLoadingOrderId(orderId);
  
      await queryClient.cancelQueries({ queryKey: ["orders"] });
  
      const previousOrders = queryClient.getQueryData<Order[]>(["orders"]);
  
      if (previousOrders) {
        queryClient.setQueryData<Order[]>(
          ["orders"],
          previousOrders.filter((order) => order.id !== orderId)
        );
      }
  
      return { previousOrders };
    },
  
    onSuccess: () => {
      toast.success("Order deleted successfully", { autoClose: 1500 });
    },
  
    onError: (_error, orderId, context) => {
      toast.error("Failed to delete order");
      if (context?.previousOrders) {
        queryClient.setQueryData(["orders"], context.previousOrders);
      }
      setLoadingOrderId(null);
    },
  
    onSettled: () => {
      setLoadingOrderId(null);
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
  });

  return (
    <><Header /><div className="container mx-auto py-12 pl-4 pr-4 xl:pl-40 xl:pr-40">
      <h2 className="text-[36px] font-semibold mb-8 font-[Inter]">Order Management</h2>

      {isLoading ? (
        <p className="col-span-4 text-center text-[12px] md:text-[16px]">Loading...</p>
      ) : error ? (
        <p className="col-span-4 text-center text-red-500">Error loading orders</p>
      ) : (
        <table className="min-w-full border-separate border-spacing-y-4">
          <thead className="shadow-md rounded">
            <tr>
              <th className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">ID</th>
              <th className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">User</th>
              <th className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">Name</th>
              <th className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">Address</th>
              <th className="p-2 md:p-4 w-fit text-[12px] md:text-[16px] text-left">Total Amount</th>
              <th className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">Status</th>
              <th className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={5} className="border p-2 text-center">
                  No orders available
                </td>
              </tr>
            ) : (
              orders
                .sort((a, b) => {
                  // Ưu tiên 'pending' trước 'done'
                  if (a.status === "pending" && b.status !== "pending") return -1;
                  if (a.status !== "pending" && b.status === "pending") return 1;
                  // Nếu cùng trạng thái, sắp xếp theo id tăng dần
                  return b.id - a.id;
                })
                .map((order: Order) => (
                  <tr key={order.id} className="shadow-md rounded">
                    <td className="p-2 md:p-4 w-fit text-[12px] md:text-[16px] text-center">{order.id}</td>
                    <td className="p-2 md:p-4 w-fit text-[12px] md:text-[16px] text-center">{order.user_id}</td>
                    <td className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">{order.name}</td>
                    <td className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">{order.address}</td>
                    <td className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">${order.total_amount}</td>
                    <td className="p-2 md:p-4 w-fit text-[12px] md:text-[16px] text-center">{order.status}</td>
                    <td className="p-2 md:p-4 w-fit text-[12px] md:text-[16px]">
                      <div className="flex flex-col lg:flex-row lg:space-x-2 items-center justify-center space-y-2 lg:space-y-0">
                      {order.status === "pending" && (
                        <button
                          className="bg-green-500 text-white text-center px-3 py-1 rounded w-[95px]"
                          onClick={() => mutationUpdate.mutate({ orderId: order.id, status: 'done' })}
                        >
                          Approve
                        </button>
                      )}

                      {/* <button
                          className="bg-yellow-500 text-white px-3 py-1 rounded"
                          onClick={() => mutationUpdate.mutate({ orderId: order.id, status: 'refused' })}
                        >
                          Refuse
                        </button>*/}
                      <button
                        className="bg-red-500 text-white px-3 py-1 rounded w-[95px]"
                        onClick={() => mutationDelete.mutate(order.id)}
                      >
                        Delete
                      </button>
                      </div>
                    </td>
                  </tr>
                )))}
          </tbody>
        </table>
      )}

    </div></>
  );
};

export default OrderManage;
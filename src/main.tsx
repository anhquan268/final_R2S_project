// main.tsx hoặc index.tsx
import React from "react"
import { createRoot } from "react-dom/client"
import { Router } from "./router/Router"
import { Layout } from "./components/Layout"
import "./App.css"
import { QueryClientProvider } from "@tanstack/react-query"
import { QueryClient } from "@tanstack/react-query"
import { ReactQueryDevtools } from "@tanstack/react-query-devtools"
import { ToastContainer } from "react-toastify";

const queryClient = new QueryClient()
createRoot(document.getElementById("root") as HTMLElement).render(     
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ReactQueryDevtools initialIsOpen={false} />
      <Layout>
        <Router />
      </Layout>
      <ToastContainer />
    </QueryClientProvider>
  </React.StrictMode>
) 

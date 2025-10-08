import { Route, Switch } from "react-router-dom";
import { BrowserRouter } from "react-router-dom/cjs/react-router-dom.min";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import React from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import Home from "./pages/home";
import MarketPlace from "./pages/marketplace";
import AgentProfile from "./pages/marketplace/agentprofile";
import Execution from "./pages/execution"; //old main
import Execute from "./pages/Execute"; //temp
import ExecuteClaude from "./pages/ExecuteClaude";
import ExecutionBackend from "./pages/ExecutionBackend";

function App() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: true,
      },
    },
  });
  return (
    <QueryClientProvider client={queryClient}>
      <React.StrictMode>
        <BrowserRouter>
          <Switch>
            <Route path="/ " component={Home} exact />
            <Route path="/marketplace/:agentid" component={AgentProfile} />
            <Route path="/marketplace" component={MarketPlace} exact />
            <Route path="/execute/gpt/:finaid" component={Execute} exact />
            <Route
              path="/execute/claude/:finaid"
              component={ExecuteClaude}
              exact
            />
            <Route path="/execute/:finaid" component={ExecutionBackend} exact />
            <Route path="/execution/:finaid" component={Execution} exact />

            <Route path="*" component={Home} exact />
          </Switch>
          <ToastContainer />
        </BrowserRouter>
      </React.StrictMode>
    </QueryClientProvider>
  );
}

export default App;

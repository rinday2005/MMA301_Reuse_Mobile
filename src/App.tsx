import { Recycle } from "lucide-react";

function App() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="flex items-center gap-2">
        <Recycle className="h-8 w-8 text-green-600" />

        <h1 className="text-3xl font-bold text-green-600">
          ReUse Hub
        </h1>
      </div>
    </div>
  );
}

export default App;
import { useNavigate } from "react-router-dom";

const Unauthorized = () => {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#fdf9f2] px-6 text-center">
      <p className="text-7xl font-bold text-[#141310]">403</p>

      <h1 className="mt-4 text-2xl font-semibold text-[#1c1c18]">
        Không có quyền truy cập
      </h1>

      <p className="mt-2 max-w-md text-sm text-[#4a463f]">
        Bạn không có quyền truy cập vào trang này.
      </p>

      <button
        type="button"
        onClick={() => navigate("/")}
        className="mt-6 rounded bg-[#141310] px-6 py-3 text-sm font-medium text-white hover:bg-[#4a463f]"
      >
        Về trang chủ
      </button>
    </div>
  );
};

export default Unauthorized;
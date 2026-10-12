import { useContext, useState } from "react";
import {
  Bell,
  ChevronRight,
  Heart,
  KeyRound,
  MapPin,
  Package,
  ShieldCheck,
  ShoppingBag,
  UserRound,
  WalletCards,
} from "lucide-react";

import { AuthContext } from "../../context/auth-context";
import AddressSelector, {
  type AddressValue,
} from "../../components/form/AddressSelector";

const Profile = () => {
  const auth = useContext(AuthContext);

  const [address, setAddress] = useState<AddressValue>({
    province: "Thành phố Đà Nẵng",
    district: "Quận Hải Châu",
    ward: "Phường Hải Châu I",
    detail: "123 Trần Phú",
  });

  const [fullName, setFullName] = useState("Elena Rostova");
  const [phone, setPhone] = useState("0905 123 456");

  const inputClass =
    "w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-sm text-[#141b2b] outline-none transition-all placeholder:text-[#9ca3af] focus:border-[#15803d] focus:ring-4 focus:ring-green-700/10";

  return (
    <div
      className="min-h-screen bg-[#f9f9ff] text-[#141b2b]"
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      <div className="mx-auto max-w-[1280px] px-4 py-8 md:px-6 lg:px-8">
        {/* Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs text-[#6b7280]">
          <span>Tài khoản</span>
          <ChevronRight size={13} />
          <span className="font-medium text-[#15803d]">
            Hồ sơ cá nhân
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
          {/* LEFT SIDEBAR */}
          <aside className="h-fit rounded-2xl border border-[#e5e7eb] bg-white p-3 shadow-sm">
            <div className="border-b border-[#f0f1f3] px-3 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9ca3af]">
                Tài khoản
              </p>
            </div>

            <nav className="mt-2 space-y-1">
              <a
                href="/profile"
                className="flex items-center gap-3 rounded-xl bg-[#f0fdf4] px-3 py-3 text-sm font-semibold text-[#15803d]"
              >
                <UserRound size={17} />
                Hồ sơ cá nhân
              </a>

              <a
                href="/my-orders"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#4b5563] transition hover:bg-[#f9fafb]"
              >
                <Package size={17} />
                Đơn hàng của tôi
              </a>

              <a
                href="/saved-items"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#4b5563] transition hover:bg-[#f9fafb]"
              >
                <Heart size={17} />
                Danh sách yêu thích
              </a>

              <a
                href="/notifications"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#4b5563] transition hover:bg-[#f9fafb]"
              >
                <Bell size={17} />
                Thông báo
              </a>

              <a
                href="/kyc"
                className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm text-[#4b5563] transition hover:bg-[#f9fafb]"
              >
                <ShieldCheck size={17} />
                Định danh KYC
              </a>
            </nav>
          </aside>

          {/* MAIN */}
          <main className="space-y-6">
            {/* PAGE TITLE */}
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15803d]">
                ReUse Hub Account
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-[-0.03em] md:text-4xl">
                Hồ sơ cá nhân
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6b7280]">
                Quản lý thông tin tài khoản, địa chỉ giao nhận, định danh
                và các thiết lập bảo mật của bạn.
              </p>
            </section>

            {/* USER SUMMARY */}
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
                <div className="flex items-center gap-5">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#dcfce7] text-2xl font-bold text-[#15803d]">
                    ER
                  </div>

                  <div>
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold">
                        {fullName}
                      </h2>

                      <span className="rounded-full bg-[#f0fdf4] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-[#15803d]">
                        Verified User
                      </span>
                    </div>

                    <p className="text-sm text-[#6b7280]">
                      Member since 2026 · Role:{" "}
                      {auth?.user?.role || "USER"}
                    </p>

                    <p className="mt-1 text-sm text-[#4b5563]">
                      elena.rostova@example.com · {phone}
                    </p>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#e5e7eb] bg-[#f9fafb] p-4 md:min-w-[260px]">
                  <div className="mb-2 flex items-center gap-2">
                    <MapPin size={16} className="text-[#15803d]" />
                    <p className="text-sm font-semibold">
                      Địa chỉ hiện tại
                    </p>
                  </div>

                  <p className="text-sm leading-6 text-[#6b7280]">
                    {address.detail}
                    <br />
                    {address.ward}, {address.district}
                    <br />
                    {address.province}
                  </p>
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Đơn hàng",
                  value: "12",
                  sub: "8 hoàn thành",
                  icon: Package,
                },
                {
                  title: "Yêu thích",
                  value: "24",
                  sub: "Sản phẩm đã lưu",
                  icon: Heart,
                },
                {
                  title: "Giao dịch",
                  value: "18",
                  sub: "RENT + THRIFT",
                  icon: WalletCards,
                },
                {
                  title: "Điểm tín nhiệm",
                  value: "98%",
                  sub: "Excellent",
                  icon: ShieldCheck,
                },
              ].map(({ title, value, sub, icon: Icon }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-[#e5e7eb] bg-white p-5 shadow-sm"
                >
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-[#f0fdf4] text-[#15803d]">
                    <Icon size={19} />
                  </div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-[#9ca3af]">
                    {title}
                  </p>

                  <p className="mt-2 text-2xl font-bold">{value}</p>

                  <p className="mt-1 text-xs text-[#6b7280]">{sub}</p>
                </div>
              ))}
            </section>

            {/* BENEFITS */}
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15803d]">
                  ReUse Hub Experience
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Lợi ích lưu trữ & Trải nghiệm
                </h2>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <a
                  href="/my-orders"
                  className="rounded-2xl border border-[#e5e7eb] p-5 transition hover:border-[#86efac] hover:bg-[#f0fdf4]"
                >
                  <ShoppingBag className="mb-4 text-[#15803d]" />
                  <p className="font-semibold">Theo dõi đơn hàng</p>
                  <p className="mt-2 text-sm leading-5 text-[#6b7280]">
                    Xem toàn bộ lịch sử RENT và THRIFT của bạn.
                  </p>
                </a>

                <a
                  href="/saved-items"
                  className="rounded-2xl border border-[#e5e7eb] p-5 transition hover:border-[#86efac] hover:bg-[#f0fdf4]"
                >
                  <Heart className="mb-4 text-[#15803d]" />
                  <p className="font-semibold">Wishlist cá nhân</p>
                  <p className="mt-2 text-sm leading-5 text-[#6b7280]">
                    Lưu sản phẩm yêu thích để quay lại nhanh hơn.
                  </p>
                </a>

                <a
                  href="/notifications"
                  className="rounded-2xl border border-[#e5e7eb] p-5 transition hover:border-[#86efac] hover:bg-[#f0fdf4]"
                >
                  <Bell className="mb-4 text-[#15803d]" />
                  <p className="font-semibold">Thông báo hệ thống</p>
                  <p className="mt-2 text-sm leading-5 text-[#6b7280]">
                    Cập nhật trạng thái đơn và hoạt động tài khoản.
                  </p>
                </a>
              </div>
            </section>

            {/* KYC */}
            <section className="rounded-3xl border border-[#bbf7d0] bg-[#f0fdf4] p-6">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#15803d] text-white">
                    <ShieldCheck size={23} />
                  </div>

                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide text-[#15803d]">
                      Identity & Trust
                    </p>

                    <h2 className="mt-1 text-xl font-bold">
                      Định danh & Tín nhiệm (KYC)
                    </h2>

                    <p className="mt-2 max-w-xl text-sm leading-6 text-[#4b5563]">
                      Tài khoản đã được xác minh. KYC giúp nâng mức độ tin
                      cậy và bảo vệ các giao dịch trên ReUse Hub.
                    </p>
                  </div>
                </div>

                <a
                  href="/kyc"
                  className="inline-flex items-center justify-center rounded-xl bg-[#15803d] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#166534]"
                >
                  Xem KYC
                </a>
              </div>
            </section>

            {/* ACCOUNT + DELIVERY FORM */}
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15803d]">
                  Account & Delivery
                </p>

                <h2 className="mt-2 text-xl font-bold">
                  Thông tin tài khoản & Giao nhận
                </h2>

                <p className="mt-2 text-sm text-[#6b7280]">
                  Cập nhật thông tin liên hệ và địa chỉ nhận hàng mặc định.
                </p>
              </div>

              <div className="mb-6 grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    Họ và tên
                  </label>

                  <input
                    value={fullName}
                    onChange={(event) =>
                      setFullName(event.target.value)
                    }
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-semibold">
                    Số điện thoại
                  </label>

                  <input
                    value={phone}
                    onChange={(event) =>
                      setPhone(event.target.value)
                    }
                    className={inputClass}
                  />
                </div>
              </div>

              {/* FE-S1-06 */}
              <AddressSelector
                value={address}
                onChange={setAddress}
              />

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  className="rounded-xl bg-[#15803d] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#166534]"
                >
                  Lưu thay đổi
                </button>
              </div>
            </section>

            {/* SECURITY */}
            <section className="rounded-3xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
              <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
                <div className="flex gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#f3f4f6]">
                    <KeyRound size={20} />
                  </div>

                  <div>
                    <h2 className="font-bold">
                      Bảo mật & Xác thực
                    </h2>
                    <p className="mt-1 text-sm text-[#6b7280]">
                      Quản lý mật khẩu và các tùy chọn bảo vệ tài khoản.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  className="rounded-xl border border-[#d1d5db] bg-white px-5 py-3 text-sm font-semibold transition hover:bg-[#f9fafb]"
                >
                  Đổi mật khẩu
                </button>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
};

export default Profile;
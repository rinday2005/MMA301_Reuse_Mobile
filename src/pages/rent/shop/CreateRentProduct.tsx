import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useShop } from '../../../context/ShopContext';

// Schema validate bằng Zod theo chuẩn Jira AC
const rentProductSchema = z.object({
  name: z.string().min(5, 'Tên thiết bị phải có ít nhất 5 ký tự'),
  category: z.string().min(1, 'Vui lòng chọn phân mục thiết bị'),
  brand: z.string().min(2, 'Vui lòng nhập thương hiệu'),
  mountSensor: z.string().min(3, 'Vui lòng nhập thông tin ngàm/cảm biến'),
  accessoriesIncluded: z.string().min(5, 'Liệt kê phụ kiện trong vali Nanuk'),
  description: z.string().min(20, 'Mô tả chi tiết và xuất xứ tối thiểu 20 ký tự'),
  pricePerDay: z.coerce.number().min(50000, 'Giá thuê tối thiểu 50.000 ₫/ngày'),
  deposit: z.coerce.number().min(500000, 'Tiền cọc tối thiểu 500.000 ₫'),
  totalUnits: z.coerce.number().min(1, 'Số lượng nhập kho tối thiểu là 1'),
  minDays: z.coerce.number().min(1, 'Số ngày thuê tối thiểu là 1'),
  maxDays: z.coerce.number().max(90, 'Số ngày thuê tối đa không quá 90'),
  handoverRule1: z.boolean().refine((val) => val === true, 'Bắt buộc đồng ý giao kèm vali Nanuk'),
  handoverRule2: z.boolean().refine((val) => val === true, 'Bắt buộc đồng ý chụp đối kiểm 3 góc'),
  handoverRule3: z.boolean().refine((val) => val === true, 'Bắt buộc đồng ý sạc pin >= 50%'),
});

type RentProductFormData = z.infer<typeof rentProductSchema>;

export const CreateRentProduct: React.FC = () => {
  const navigate = useNavigate();
  const { addProduct } = useShop();

  const [coverImage, setCoverImage] = useState<string>('');
  const [detailImages, setDetailImages] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RentProductFormData>({
    resolver: zodResolver(rentProductSchema),
    defaultValues: {
      category: '',
      minDays: 2,
      maxDays: 30,
      totalUnits: 1,
      handoverRule1: false,
      handoverRule2: false,
      handoverRule3: false,
    },
  });

  // Watch các trường để live preview
  const watchedName = watch('name');
  const watchedPrice = watch('pricePerDay');
  const watchedDeposit = watch('deposit');
  const watchedUnits = watch('totalUnits');
  const watchedMinDays = watch('minDays');

  const onSubmit = (data: RentProductFormData) => {
    if (!coverImage) {
      alert('Vui lòng tải lên ảnh bìa đại diện!');
      return;
    }
    if (detailImages.length < 3) {
      alert('Vui lòng tải tối thiểu 3 ảnh chi tiết kỹ thuật!');
      return;
    }

    const autoSku = `HBL-${Date.now().toString().slice(-6)}`;

    addProduct({
      sku: autoSku,
      name: data.name,
      category: data.category,
      brand: data.brand,
      mountSensor: data.mountSensor,
      accessoriesIncluded: data.accessoriesIncluded,
      description: data.description,
      pricePerDay: data.pricePerDay,
      deposit: data.deposit,
      replacementValue: data.deposit * 2,
      totalUnits: data.totalUnits,
      readyUnits: data.totalUnits,
      rentingUnits: 0,
      coverImage,
      inspectionImages: detailImages,
      minDays: data.minDays,
      maxDays: data.maxDays,
      maintenanceUnits: 0,
    });

    alert('Đã tạo thành công sản phẩm RENT mới ở trạng thái "Chờ duyệt" (Pending)!');
    navigate('/shop/rent/products');
  };

  return (
    <div className="w-full flex flex-col font-sans text-[#1c1c18] bg-[#fdf9f2]">
      <div className="max-w-[1440px] mx-auto px-5 lg:px-12 py-8 w-full">
        <div className="mb-6">
          <h1 className="font-serif text-3xl text-[#141310]">Khởi tạo Sản phẩm Cho thuê RENT</h1>
          <p className="text-xs text-[#7b766f] mt-1">
            Mọi sản phẩm tạo mới sẽ ở trạng thái <strong>"Chờ duyệt" (Pending)</strong> để Admin thẩm định. (ownerId được hệ thống tự xác định).
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cột trái (Form nhập) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Ảnh */}
            <div className="bg-white p-6 rounded-xl border border-[#ebe8e1] space-y-4 shadow-sm">
              <h2 className="font-serif text-lg text-[#141310]">A. Ảnh sản phẩm &amp; Thẩm định</h2>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Ảnh bìa chính *</label>
                {coverImage ? (
                  <div className="relative w-48 h-32 rounded overflow-hidden border">
                    <img src={coverImage} alt="Cover" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setCoverImage('')}
                      className="absolute top-1 right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded"
                    >
                      Xóa
                    </button>
                  </div>
                ) : (
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setCoverImage(URL.createObjectURL(file));
                    }}
                    className="text-xs"
                  />
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Ảnh kỹ thuật 3 góc (Tối thiểu 3 ảnh) *</label>
                <div className="flex gap-2 flex-wrap mb-2">
                  {detailImages.map((img, i) => (
                    <img key={i} src={img} alt="Detail" className="w-20 h-20 object-cover rounded border" />
                  ))}
                </div>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setDetailImages(files.map((f) => URL.createObjectURL(f)));
                  }}
                  className="text-xs"
                />
              </div>
            </div>

            {/* Thông tin */}
            <div className="bg-white p-6 rounded-xl border border-[#ebe8e1] space-y-4 shadow-sm">
              <h2 className="font-serif text-lg text-[#141310]">B. Thông tin cơ bản</h2>
              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Tên thiết bị &amp; Bộ kit *</label>
                <input
                  {...register('name')}
                  placeholder="Ví dụ: Hasselblad 907X 50C + Lens XCD 45mm"
                  className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none"
                />
                {errors.name && <p className="text-red-600 text-[11px] mt-1">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Phân mục *</label>
                  <select {...register('category')} className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none">
                    <option value="">-- Chọn danh mục --</option>
                    <option value="Medium Format Digital">Medium Format Digital</option>
                    <option value="Analog 35mm">Analog 35mm</option>
                    <option value="Hybrid Mirrorless">Hybrid Mirrorless</option>
                    <option value="Cinema Optics">Cinema Optics</option>
                  </select>
                  {errors.category && <p className="text-red-600 text-[11px] mt-1">{errors.category.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Thương hiệu *</label>
                  <input {...register('brand')} placeholder="Hasselblad, Leica..." className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                  {errors.brand && <p className="text-red-600 text-[11px] mt-1">{errors.brand.message}</p>}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Ngàm &amp; Cảm biến *</label>
                <input {...register('mountSensor')} placeholder="XCD Mount • 50MP CMOS" className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                {errors.mountSensor && <p className="text-red-600 text-[11px] mt-1">{errors.mountSensor.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Phụ kiện kèm vali *</label>
                <input {...register('accessoriesIncluded')} placeholder="2 pin zin, sạc đôi, dây da..." className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                {errors.accessoriesIncluded && <p className="text-red-600 text-[11px] mt-1">{errors.accessoriesIncluded.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase mb-1">Mô tả xuất xứ &amp; lưu ký *</label>
                <textarea rows={4} {...register('description')} className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                {errors.description && <p className="text-red-600 text-[11px] mt-1">{errors.description.message}</p>}
              </div>
            </div>

            {/* Tài chính & Tồn kho */}
            <div className="bg-white p-6 rounded-xl border border-[#ebe8e1] space-y-4 shadow-sm">
              <h2 className="font-serif text-lg text-[#141310]">C. Biểu phí &amp; Số lượng nhập kho</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Giá thuê/ngày *</label>
                  <input type="number" {...register('pricePerDay')} placeholder="450000" className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                  {errors.pricePerDay && <p className="text-red-600 text-[11px] mt-1">{errors.pricePerDay.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Tiền cọc Escrow *</label>
                  <input type="number" {...register('deposit')} placeholder="16000000" className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                  {errors.deposit && <p className="text-red-600 text-[11px] mt-1">{errors.deposit.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Số lượng máy nhập *</label>
                  <input type="number" {...register('totalUnits')} className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                  {errors.totalUnits && <p className="text-red-600 text-[11px] mt-1">{errors.totalUnits.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Thuê tối thiểu (ngày)</label>
                  <input type="number" {...register('minDays')} className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase mb-1">Thuê tối đa (ngày)</label>
                  <input type="number" {...register('maxDays')} className="w-full px-3 py-2 bg-[#f7f3ec] rounded text-sm focus:outline-none" />
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" {...register('handoverRule1')} /> Bàn giao kèm vali chống sốc Nanuk
                </label>
                {errors.handoverRule1 && <p className="text-red-600 text-[11px]">{errors.handoverRule1.message}</p>}

                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" {...register('handoverRule2')} /> Chụp đối kiểm cảm biến trước khi gửi
                </label>
                {errors.handoverRule2 && <p className="text-red-600 text-[11px]">{errors.handoverRule2.message}</p>}

                <label className="flex items-center gap-2 text-xs">
                  <input type="checkbox" {...register('handoverRule3')} /> Pin sạc đầy &gt;= 50% khi giao
                </label>
                {errors.handoverRule3 && <p className="text-red-600 text-[11px]">{errors.handoverRule3.message}</p>}
              </div>
            </div>
          </div>

          {/* Cột phải: Live Preview & Submit */}
          <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
            <div className="bg-white p-5 rounded-xl border border-[#ebe8e1] shadow-sm">
              <h3 className="text-xs uppercase font-bold text-[#7b766f] mb-3">Live Preview</h3>
              <div className="bg-[#f7f3ec] rounded-lg overflow-hidden border">
                <div className="aspect-[4/3] bg-gray-200 flex items-center justify-center">
                  {coverImage ? <img src={coverImage} alt="Preview" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500">Chưa có ảnh</span>}
                </div>
                <div className="p-3 space-y-1">
                  <span className="text-[10px] bg-[#141310] text-white px-1.5 py-0.5 rounded font-mono">CHỜ DUYỆT (PENDING)</span>
                  <div className="font-semibold text-sm truncate">{watchedName || 'Tên thiết bị mẫu'}</div>
                  <div className="text-xs font-mono font-bold text-[#576151]">{Number(watchedPrice || 0).toLocaleString()} ₫/ngày</div>
                  <div className="text-[11px] text-[#7b766f]">Cọc Escrow: {Number(watchedDeposit || 0).toLocaleString()} ₫</div>
                  <div className="text-[11px] text-[#7b766f]">Tồn kho: {watchedUnits || 1} máy • Tối thiểu {watchedMinDays || 2} ngày</div>
                </div>
              </div>

              <button
                type="submit"
                className="mt-6 w-full py-3.5 bg-[#141310] hover:bg-[#292724] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow transition-all cursor-pointer"
              >
                Gửi yêu cầu duyệt đến Admin
              </button>
              <Link to="/shop/rent/products" className="block text-center text-xs text-[#7b766f] hover:text-[#141310] mt-3">
                Hủy và quay lại
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
import React, { useState, useMemo, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CATEGORIES_DATA } from '../../data/categories/categoriesData';
import { RENT_PRODUCTS } from '../../data/rent/marketplaceData';
import { THRIFT_PRODUCTS } from '../../data/thrift/thriftMarketplaceData';

type ModeFilter = 'all' | 'rent' | 'thrift';

interface Props {
  slugOverride?: string;
  nameOverride?: string;
}

export const CategoryProductListing: React.FC<Props> = ({ slugOverride, nameOverride }) => {
  const { slug: paramSlug } = useParams<{ slug?: string }>();
  const activeSlug = slugOverride || paramSlug || 'cameras';
  const [modeFilter, setModeFilter] = useState<ModeFilter>('all');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [activeSlug]);

  const category = useMemo(() => {
    return (
      CATEGORIES_DATA.find(
        (c) => c.slug === activeSlug || c.id === activeSlug
      ) || CATEGORIES_DATA[0]
    );
  }, [activeSlug]);

  const categoryTitle = nameOverride || category.title;

  // Matching RENT products
  const rentItems = useMemo(() => {
    const q = category.categoryQuery.toLowerCase();
    return RENT_PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        category.tags.includes('rent')
    );
  }, [category]);

  // Matching THRIFT products
  const thriftItems = useMemo(() => {
    const q = category.categoryQuery.toLowerCase();
    return THRIFT_PRODUCTS.filter(
      (p) =>
        p.category.toLowerCase().includes(q) ||
        p.categoryLabel.toLowerCase().includes(q) ||
        category.tags.includes('thrift')
    );
  }, [category]);

  const formatVND = (num: number) =>
    new Intl.NumberFormat('vi-VN').format(num) + '₫';

  return (
    <div className="w-full min-h-screen bg-[#FBF9F5] text-[#1C1A18] antialiased">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-[#78736A] tracking-wide">
          <Link to="/" className="hover:text-[#1C1A18] transition-colors">
            Trang chủ
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <Link to="/categories" className="hover:text-[#1C1A18] transition-colors">
            Danh mục sản phẩm
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="text-[#1C1A18] font-semibold truncate max-w-xs">
            {categoryTitle}
          </span>
        </nav>

        {/* Category Header Banner */}
        <section
          data-reveal
          className="relative rounded-3xl overflow-hidden bg-[#F7F5F0] border border-[#E6E2DC] shadow-sm p-6 sm:p-10 flex flex-col lg:flex-row items-center gap-8 justify-between"
        >
          <div className="space-y-4 max-w-2xl z-10">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-[#79716B]">
              <span className="bg-[#1C1A18] text-white px-2 py-0.5 rounded text-[10px] font-bold">
                {category.code}
              </span>
              <span>LƯU TRỮ TUẦN HOÀN</span>
              <span className="text-[#E6E2DC]">·</span>
              <span className="font-semibold text-[#1C1A18]">{category.subtitle}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-[#1C1A18] font-semibold tracking-tight">
              {categoryTitle}
            </h1>

            <p className="text-xs sm:text-sm text-[#79716B] leading-relaxed max-w-xl">
              {category.description}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E6E2DC] font-semibold text-[#1C1A18] shadow-xs">
                {category.rentCount} thiết bị RENT
              </span>
              <span className="px-3 py-1.5 rounded-full bg-white border border-[#E6E2DC] font-semibold text-[#1C1A18] shadow-xs">
                {category.thriftCount} sản phẩm THRIFT
              </span>
              <span className="px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 font-semibold text-emerald-800">
                100% Khử trùng &amp; Bảo đảm 72h
              </span>
            </div>
          </div>

          <div className="w-full lg:w-80 aspect-[4/3] rounded-2xl overflow-hidden bg-[#E6E2DC] shadow-md shrink-0">
            <img
              src={category.image}
              alt={categoryTitle}
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Mode Selector Switcher */}
        <div data-reveal className="flex items-center justify-between flex-wrap gap-4 border-b border-[#E6E2DC] pb-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setModeFilter('all')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                modeFilter === 'all'
                  ? 'bg-[#1C1A18] text-white shadow-xs'
                  : 'bg-[#F0ECE1] text-[#79716B] hover:text-[#1C1A18]'
              }`}
            >
              Tất cả sản phẩm ({rentItems.length + thriftItems.length})
            </button>
            <button
              type="button"
              onClick={() => setModeFilter('rent')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                modeFilter === 'rent'
                  ? 'bg-[#1C1A18] text-white shadow-xs'
                  : 'bg-[#F0ECE1] text-[#79716B] hover:text-[#1C1A18]'
              }`}
            >
              Thuê RENT ({rentItems.length})
            </button>
            <button
              type="button"
              onClick={() => setModeFilter('thrift')}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                modeFilter === 'thrift'
                  ? 'bg-[#1C1A18] text-white shadow-xs'
                  : 'bg-[#F0ECE1] text-[#79716B] hover:text-[#1C1A18]'
              }`}
            >
              Mua THRIFT ({thriftItems.length})
            </button>
          </div>

          <Link
            to="/categories"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#79716B] hover:text-[#1C1A18] transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Xem tất cả danh mục</span>
          </Link>
        </div>

        {/* Products Grid */}
        <div data-reveal className="space-y-12">
          {/* Section 1: RENT PRODUCTS */}
          {(modeFilter === 'all' || modeFilter === 'rent') && rentItems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#79716B] font-bold">
                    DỊCH VỤ THUÊ LINH HOẠT
                  </span>
                  <h2 className="text-xl font-bold text-[#1C1A18]">
                    Thiết bị RENT trong danh mục
                  </h2>
                </div>
                <Link
                  to={`/rent?category=${encodeURIComponent(category.categoryQuery)}`}
                  className="text-xs font-semibold text-[#1C1A18] hover:underline"
                >
                  Xem thêm trong RENT →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {rentItems.map((item) => (
                  <article
                    key={`rent-${item.id}`}
                    className="group bg-white rounded-2xl border border-[#E6E2DC] overflow-hidden p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F4F0EA] relative mb-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#1C1A18] text-white">
                          RENT
                        </span>
                        <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 text-[#1C1A18] backdrop-blur-xs">
                          {item.conditionLabel}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#79716B] block mb-1">
                        {item.categoryLabel} · {item.location}
                      </span>
                      <h3 className="text-sm font-bold text-[#1C1A18] group-hover:text-[#B45309] transition-colors line-clamp-1">
                        <Link to={item.href}>{item.title}</Link>
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-[#E6E2DC] mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-[#79716B] block">GIÁ THUÊ</span>
                        <span className="text-sm font-bold text-[#1C1A18]">{formatVND(item.price)}/ngày</span>
                      </div>
                      <Link
                        to={item.href}
                        className="px-3 py-1.5 rounded-lg bg-[#1C1A18] text-white text-[11px] font-bold hover:bg-black transition-colors"
                      >
                        Thuê ngay
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Section 2: THRIFT PRODUCTS */}
          {(modeFilter === 'all' || modeFilter === 'thrift') && thriftItems.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#79716B] font-bold">
                    SỞ HỮU TUẦN HOÀN BẢO CHỨNG
                  </span>
                  <h2 className="text-xl font-bold text-[#1C1A18]">
                    Sản phẩm THRIFT trong danh mục
                  </h2>
                </div>
                <Link
                  to={`/thrift?category=${encodeURIComponent(category.categoryQuery.toLowerCase())}`}
                  className="text-xs font-semibold text-[#1C1A18] hover:underline"
                >
                  Xem thêm trong THRIFT →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {thriftItems.map((item) => (
                  <article
                    key={`thrift-${item.id}`}
                    className="group bg-white rounded-2xl border border-[#E6E2DC] overflow-hidden p-3.5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="aspect-[4/3] rounded-xl overflow-hidden bg-[#F4F0EA] relative mb-3">
                        <img
                          src={item.image}
                          alt={item.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <span className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#B45309] text-white">
                          THRIFT
                        </span>
                        <span className="absolute top-2 right-2 text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/90 text-[#1C1A18] backdrop-blur-xs">
                          {item.condition}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#79716B] block mb-1">
                        {item.categoryLabel} · {item.location}
                      </span>
                      <h3 className="text-sm font-bold text-[#1C1A18] group-hover:text-[#B45309] transition-colors line-clamp-1">
                        <Link to={item.href}>{item.title}</Link>
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-[#E6E2DC] mt-3 flex items-center justify-between">
                      <div>
                        <span className="text-[9px] uppercase font-mono text-[#79716B] block">GIÁ MUA</span>
                        <span className="text-sm font-bold text-[#1C1A18]">{formatVND(item.price)}</span>
                      </div>
                      <Link
                        to={item.href}
                        className="px-3 py-1.5 rounded-lg bg-[#1C1A18] text-white text-[11px] font-bold hover:bg-black transition-colors"
                      >
                        Mua ngay
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* Empty fallback if no items match in filter */}
          {((modeFilter === 'rent' && rentItems.length === 0) ||
            (modeFilter === 'thrift' && thriftItems.length === 0) ||
            (rentItems.length === 0 && thriftItems.length === 0)) && (
            <div className="p-12 text-center bg-[#F7F5F0] rounded-2xl border border-[#E6E2DC]">
              <p className="text-xs text-[#79716B]">
                Hiện chưa có sản phẩm nào trong chế độ lọc này của danh mục {categoryTitle}.
              </p>
              <button
                type="button"
                onClick={() => setModeFilter('all')}
                className="mt-3 px-4 py-2 bg-[#1C1A18] text-white text-xs font-semibold rounded-xl"
              >
                Hiển thị tất cả
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryProductListing;

import { useEffect, useState } from "react";
import axios from "axios";

type Province = {
  code: number;
  name: string;
};

type District = {
  code: number;
  name: string;
};

type Ward = {
  code: number;
  name: string;
};

export type AddressValue = {
  province: string;
  district: string;
  ward: string;
  detail: string;
};

type AddressSelectorProps = {
  value?: AddressValue;
  onChange?: (value: AddressValue) => void;
};

const API_BASE_URL = "https://provinces.open-api.vn/api/v1";

const initialAddress: AddressValue = {
  province: "",
  district: "",
  ward: "",
  detail: "",
};

const AddressSelector = ({
  value = initialAddress,
  onChange,
}: AddressSelectorProps) => {
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  const [provinceCode, setProvinceCode] = useState("");
  const [districtCode, setDistrictCode] = useState("");
  const [wardCode, setWardCode] = useState("");

  const [address, setAddress] = useState<AddressValue>(value);

  const [loadingProvince, setLoadingProvince] = useState(false);
  const [loadingDistrict, setLoadingDistrict] = useState(false);
  const [loadingWard, setLoadingWard] = useState(false);

  const updateAddress = (newAddress: AddressValue) => {
    setAddress(newAddress);
    onChange?.(newAddress);
  };

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvince(true);

        const response = await axios.get<Province[]>(
          `${API_BASE_URL}/p/`
        );

        setProvinces(response.data);
      } catch (error) {
        console.error("Failed to load provinces:", error);
      } finally {
        setLoadingProvince(false);
      }
    };

    fetchProvinces();
  }, []);

  const handleProvinceChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCode = event.target.value;

    setProvinceCode(selectedCode);
    setDistrictCode("");
    setWardCode("");

    setDistricts([]);
    setWards([]);

    const selectedProvince = provinces.find(
      (province) => province.code === Number(selectedCode)
    );

    updateAddress({
      province: selectedProvince?.name || "",
      district: "",
      ward: "",
      detail: address.detail,
    });

    if (!selectedCode) return;

    try {
      setLoadingDistrict(true);

      const response = await axios.get<{
        districts: District[];
      }>(`${API_BASE_URL}/p/${selectedCode}?depth=2`);

      setDistricts(response.data.districts || []);
    } catch (error) {
      console.error("Failed to load districts:", error);
      setDistricts([]);
    } finally {
      setLoadingDistrict(false);
    }
  };

  const handleDistrictChange = async (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCode = event.target.value;

    setDistrictCode(selectedCode);
    setWardCode("");
    setWards([]);

    const selectedDistrict = districts.find(
      (district) => district.code === Number(selectedCode)
    );

    updateAddress({
      ...address,
      district: selectedDistrict?.name || "",
      ward: "",
    });

    if (!selectedCode) return;

    try {
      setLoadingWard(true);

      const response = await axios.get<{
        wards: Ward[];
      }>(`${API_BASE_URL}/d/${selectedCode}?depth=2`);

      setWards(response.data.wards || []);
    } catch (error) {
      console.error("Failed to load wards:", error);
      setWards([]);
    } finally {
      setLoadingWard(false);
    }
  };

  const handleWardChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const selectedCode = event.target.value;

    setWardCode(selectedCode);

    const selectedWard = wards.find(
      (ward) => ward.code === Number(selectedCode)
    );

    updateAddress({
      ...address,
      ward: selectedWard?.name || "",
    });
  };

  const handleDetailChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    updateAddress({
      ...address,
      detail: event.target.value,
    });
  };

  const labelClass =
    "mb-1.5 block text-sm font-semibold text-[#141b2b]";

  const fieldClass =
    "w-full rounded-xl border border-[#d1d5db] bg-white px-4 py-3 text-sm text-[#141b2b] outline-none transition-all duration-150 placeholder:text-[#9ca3af] focus:border-[#16a34a] focus:ring-4 focus:ring-[rgba(22,163,74,0.12)] disabled:cursor-not-allowed disabled:bg-[#f1f3ff] disabled:text-[#6f7a6e]";

  return (
    <section
      className="rounded-[24px] border border-[#f3f4f6] bg-white p-6"
      style={{
        fontFamily: "Inter, sans-serif",
        boxShadow:
          "0 1px 3px 0 rgba(0,0,0,0.04), 0 10px 25px -5px rgba(0,0,0,0.04)",
      }}
    >
      <div className="mb-6">
        <div className="mb-2 inline-flex items-center rounded-full bg-[#f0fdf4] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#15803d]">
          Verified Address
        </div>

        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[#141b2b]">
          Delivery Address
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-5 text-[#4b5563]">
          Select your province, district and ward, then enter the detailed
          street address.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label htmlFor="province" className={labelClass}>
            Province / City
          </label>

          <select
            id="province"
            value={provinceCode}
            onChange={handleProvinceChange}
            disabled={loadingProvince}
            className={fieldClass}
          >
            <option value="">
              {loadingProvince
                ? "Loading provinces..."
                : "Select Province / City"}
            </option>

            {provinces.map((province) => (
              <option key={province.code} value={province.code}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="district" className={labelClass}>
            District
          </label>

          <select
            id="district"
            value={districtCode}
            onChange={handleDistrictChange}
            disabled={!provinceCode || loadingDistrict}
            className={fieldClass}
          >
            <option value="">
              {loadingDistrict
                ? "Loading districts..."
                : "Select District"}
            </option>

            {districts.map((district) => (
              <option key={district.code} value={district.code}>
                {district.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="ward" className={labelClass}>
            Ward / Commune
          </label>

          <select
            id="ward"
            value={wardCode}
            onChange={handleWardChange}
            disabled={!districtCode || loadingWard}
            className={fieldClass}
          >
            <option value="">
              {loadingWard
                ? "Loading wards..."
                : "Select Ward / Commune"}
            </option>

            {wards.map((ward) => (
              <option key={ward.code} value={ward.code}>
                {ward.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="detail" className={labelClass}>
            Street Address
          </label>

          <input
            id="detail"
            type="text"
            value={address.detail}
            onChange={handleDetailChange}
            placeholder="House number, street name"
            className={fieldClass}
          />
        </div>
      </div>

      <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f0fdf4] p-4">
        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#15803d] text-sm font-bold text-white">
          ✓
        </div>

        <div>
          <p className="text-sm font-semibold text-[#141b2b]">
            Cascading address verification
          </p>
          <p className="mt-1 text-xs leading-5 text-[#4b5563]">
            Changing Province resets District and Ward. Changing District resets
            Ward to keep the address hierarchy consistent.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AddressSelector;
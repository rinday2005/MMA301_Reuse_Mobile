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

    if (!selectedCode) {
      return;
    }

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

    if (!selectedCode) {
      return;
    }

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

  return (
    <div className="grid gap-4">
      <div>
        <label
          htmlFor="province"
          className="mb-1 block text-sm font-medium"
        >
          Tỉnh / Thành phố
        </label>

        <select
          id="province"
          value={provinceCode}
          onChange={handleProvinceChange}
          disabled={loadingProvince}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">
            {loadingProvince
              ? "Đang tải..."
              : "Chọn Tỉnh / Thành phố"}
          </option>

          {provinces.map((province) => (
            <option
              key={province.code}
              value={province.code}
            >
              {province.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="district"
          className="mb-1 block text-sm font-medium"
        >
          Quận / Huyện
        </label>

        <select
          id="district"
          value={districtCode}
          onChange={handleDistrictChange}
          disabled={!provinceCode || loadingDistrict}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">
            {loadingDistrict
              ? "Đang tải..."
              : "Chọn Quận / Huyện"}
          </option>

          {districts.map((district) => (
            <option
              key={district.code}
              value={district.code}
            >
              {district.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="ward"
          className="mb-1 block text-sm font-medium"
        >
          Phường / Xã
        </label>

        <select
          id="ward"
          value={wardCode}
          onChange={handleWardChange}
          disabled={!districtCode || loadingWard}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">
            {loadingWard
              ? "Đang tải..."
              : "Chọn Phường / Xã"}
          </option>

          {wards.map((ward) => (
            <option
              key={ward.code}
              value={ward.code}
            >
              {ward.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label
          htmlFor="detail"
          className="mb-1 block text-sm font-medium"
        >
          Số nhà, tên đường
        </label>

        <input
          id="detail"
          type="text"
          value={address.detail}
          onChange={handleDetailChange}
          placeholder="Ví dụ: 123 Nguyễn Trãi"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 outline-none focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default AddressSelector;
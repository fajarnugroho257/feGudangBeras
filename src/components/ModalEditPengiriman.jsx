import React, { useState, useEffect, useCallback, useRef, memo } from "react";
import Select from "react-select";
import RupiahFormat from "../utilities/RupiahFormat";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import api from "../utilities/axiosInterceptor";

const PengirimanRow = memo(function PengirimanRow({
  field,
  index,
  barangOptions,
  supplierOptions,
  onTypeChange,
  onBarangChange,
  onSupplierChange,
  onInputChange,
  onRemove,
  isFirst,
}) {
  const rowNumber = index + 1;

  return (
    <tr className="hover:bg-teal-50/20 transition-colors">
      <td className="py-2 px-2 text-center text-sm font-medium text-gray-500 border-r border-gray-100">
        {rowNumber}
      </td>

      {/* Tipe */}
      <td className="py-2 px-3 border-r border-gray-100">
        <select
          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
          name="barang_tipe"
          value={field.barang_tipe}
          onChange={(e) => onTypeChange(index, e.target.value)}
        >
          <option value="beras">Beras</option>
          <option value="katul">Katul</option>
          <option value="sekam">Sekam</option>
        </select>
      </td>

      {/* Barang — lazy: options fetched when type is first seen */}
      <td className="py-2 px-3 border-r border-gray-100">
        <Select
          value={field.selectedBarang}
          onChange={(selected) => onBarangChange(index, selected)}
          options={barangOptions}
          placeholder={barangOptions.length === 0 ? "Memuat…" : "Pilih Barang"}
          isClearable
          isLoading={barangOptions.length === 0 && !!field.barang_tipe}
          menuPortalTarget={document.body}
          styles={selectStyles}
        />
      </td>

      {/* Supplier — lazy: options appear only after barang is chosen */}
      <td className="py-2 px-3 border-r border-gray-100">
        <Select
          value={field.selectedSupplier}
          onChange={(selected) => onSupplierChange(index, selected)}
          options={supplierOptions}
          placeholder={
            !field.barang_id
              ? "Pilih barang dulu"
              : supplierOptions.length === 0
              ? "Memuat…"
              : "Pilih Supplier"
          }
          isClearable
          isDisabled={!field.barang_id}
          isLoading={!!field.barang_id && supplierOptions.length === 0 && !field.selectedSupplier}
          menuPortalTarget={document.body}
          styles={selectStyles}
        />
      </td>

      {/* Stok (read-only) */}
      <td className="py-2 px-3 border-r border-gray-100">
        <input
          readOnly
          type="text"
          className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-center text-gray-700 font-medium cursor-not-allowed outline-none"
          value={field.current_stock}
        />
      </td>

      {/* Tonase */}
      <td className="py-2 px-3 border-r border-gray-100">
        <input
          type="number"
          required
          name="data_tonase"
          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-center text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
          value={field.data_tonase}
          onChange={(e) => onInputChange(index, e)}
          onFocus={(e) =>
            e.target.addEventListener("wheel", (ev) => ev.preventDefault(), {
              passive: false,
            })
          }
        />
      </td>

      {/* Harga */}
      <td className="py-2 px-3 border-r border-gray-100">
        <input
          type="number"
          required
          name="data_harga"
          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-right text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
          value={field.data_harga}
          onChange={(e) => onInputChange(index, e)}
          onFocus={(e) =>
            e.target.addEventListener("wheel", (ev) => ev.preventDefault(), {
              passive: false,
            })
          }
        />
      </td>

      {/* Total (read-only) */}
      <td className="py-2 px-3 border-r border-gray-100">
        <input
          readOnly
          type="text"
          className="w-full py-1.5 px-2 bg-gray-100 border border-gray-200 rounded-md text-sm text-right text-gray-800 font-bold cursor-not-allowed outline-none"
          value={RupiahFormat(field.data_total || 0)}
        />
      </td>

      {/* Pembayaran */}
      <td className="py-2 px-3 border-r border-gray-100">
        <select
          className="w-full py-1.5 px-2 bg-white border border-gray-200 rounded-md text-sm text-gray-700 focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
          name="pembayaran_st"
          value={field.pembayaran_st}
          onChange={(e) => onInputChange(index, e)}
        >
          <option value="cash">Cash</option>
          <option value="hutang">Hutang</option>
        </select>
      </td>

      {/* Aksi */}
      <td className="py-2 px-2 text-center">
        {isFirst ? (
          <button
            type="button"
            disabled
            className="w-8 h-8 rounded-lg bg-gray-100 text-gray-400 cursor-not-allowed"
          >
            <i className="fa fa-trash" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onRemove(index)}
            className="w-8 h-8 rounded-lg bg-red-50 text-red-500 hover:bg-red-100 hover:text-red-600 transition-colors"
          >
            <i className="fa fa-trash" />
          </button>
        )}
      </td>
    </tr>
  );
});

// ─── Shared react-select styles (defined once, not recreated per render) ──────
const selectStyles = {
  menuPortal: (base) => ({ ...base, zIndex: 9999 }),
  control: (base, state) => ({
    ...base,
    minHeight: "34px",
    fontSize: "13px",
    borderColor: state.isFocused ? "#2dd4bf" : "#e5e7eb",
    boxShadow: state.isFocused ? "0 0 0 1px #2dd4bf" : "none",
    borderRadius: "0.375rem",
    "&:hover": { borderColor: "#2dd4bf" },
  }),
};

// ─── Empty row factory ────────────────────────────────────────────────────────
const emptyRow = () => ({
  barang_tipe: "beras",
  barang_id: null,
  selectedBarang: null,
  supplier_id: null,
  selectedSupplier: null,
  current_stock: 0,
  data_tonase: "",
  data_harga: "",
  data_total: "",
  pembayaran_st: "cash",
});

// ─── Main component ───────────────────────────────────────────────────────────
export default function ModalEditPengiriman({ pengiriman_id, isOpen, onClose }) {
  const token = localStorage.getItem("token");

  // Header fields
  const [pengiriman_tgl, setPengiriman_tgl] = useState("");
  const [nama_pembeli, setNama_pembeli]     = useState("");
  const [uang_muka, setUang_muka]           = useState("");
  const [status, setStatus]                 = useState("yes");

  // Line items
  const [rows, setRows] = useState([]);

  /**
   * barangCache:  { [tipe]: Option[] }   — fetched once per tipe, on demand
   * stockCache:   { [barang_id]: { stockData, supplierOptions } }
   *
   * We use refs so cache reads/writes never trigger re-renders.
   */
  const barangCacheRef  = useRef({});
  const stockCacheRef   = useRef({});

  // Per-row supplier options kept in state so rows re-render when loaded
  const [supplierOptionsByIndex, setSupplierOptionsByIndex] = useState({});

  // ── Lazy fetch: barang options for a given tipe ──────────────────────────
  const fetchBarangByType = useCallback(
    async (tipe) => {
      if (barangCacheRef.current[tipe]) return barangCacheRef.current[tipe];
      try {
        const res = await api.get("/get-barang", {
          params: { tipe },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200 && Array.isArray(res.data.dataBarang)) {
          const options = res.data.dataBarang.map((item) => ({
            value: item.id,
            label: item.nama,
          }));
          barangCacheRef.current[tipe] = options;
          return options;
        }
      } catch (err) {
        console.error(`fetchBarangByType(${tipe}):`, err);
      }
      return [];
    },
    [token]
  );

  // ── Lazy fetch: stock + supplier options for a given barang_id ───────────
  const fetchStock = useCallback(
    async (barangId) => {
      if (stockCacheRef.current[barangId]) return stockCacheRef.current[barangId];
      try {
        const res = await api.get("/get-stock", {
          params: { barang_id: barangId },
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.status === 200 && Array.isArray(res.data.dataStock)) {
          const stockData = res.data.dataStock;
          const supplierOptions = stockData.map((stk) => ({
            value: stk.suplier_id,
            label: `${stk.suplier?.suplier_nama} (Stok: ${stk.stok})`,
          }));
          stockCacheRef.current[barangId] = { stockData, supplierOptions };
          return stockCacheRef.current[barangId];
        }
      } catch (err) {
        console.error(`fetchStock(${barangId}):`, err);
      }
      return { stockData: [], supplierOptions: [] };
    },
    [token]
  );

  // ── Load existing pengiriman when modal opens ────────────────────────────
  useEffect(() => {
    if (!isOpen || !pengiriman_id) return;

    // Reset on open
    setRows([]);
    setSupplierOptionsByIndex({});

    const toastId = toast.loading("Getting data...");

    (async () => {
      try {
        // Fetch ALL tipe options upfront in parallel so we can build a
        // reverse lookup: barang_id → tipe (response doesn't include barang.tipe)
        const ALL_TIPES = ["beras", "katul", "sekam"];
        await Promise.all(ALL_TIPES.map((t) => fetchBarangByType(t)));

        // Build reverse map: { [barang_id]: tipe }
        const barangIdToTipe = {};
        for (const tipe of ALL_TIPES) {
          const opts = barangCacheRef.current[tipe] || [];
          for (const opt of opts) {
            barangIdToTipe[opt.value] = tipe;
          }
        }

        const res = await api.get(`/detail-Pengiriman/${pengiriman_id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status !== 200) throw new Error(`HTTP ${res.status}`);

        const d = res.data.data;
        setPengiriman_tgl(d.pengiriman_tgl ? d.pengiriman_tgl.split("T")[0] : "");
        setNama_pembeli(d.nama_pembeli || "");
        setUang_muka(d.uang_muka || "");
        setStatus(d.status || "yes");

        const list = d.listPengiriman || [];

        // Fetch barang + stock for every row in parallel
        const [processedRows, supplierMap] = await (async () => {
          const built   = [];
          const supMap  = {};

          await Promise.all(
            list.map(async (item, index) => {
              // ✅ Look up correct tipe from reverse map; fallback to "beras" only
              // if the barang_id genuinely isn't found in any tipe list.
              const tipe    = barangIdToTipe[item.barang_id] ?? "beras";
              const options = barangCacheRef.current[tipe] || [];
              const matched = options.find((o) => o.value === item.barang_id);

              let current_stock    = 0;
              let selectedSupplier = null;

              if (item.barang_id) {
                const { stockData, supplierOptions } = await fetchStock(item.barang_id);
                supMap[index] = supplierOptions;

                const entry = stockData.find((s) => s.suplier_id === item.supplier_id);
                if (entry) {
                  current_stock    = entry.stok;
                  selectedSupplier = {
                    value: entry.suplier_id,
                    label: entry.suplier?.suplier_nama,
                  };
                }
              }

              built[index] = {
                id: item.id,
                barang_tipe:      tipe,
                barang_id:        item.barang_id,
                selectedBarang:   matched ?? null,
                supplier_id:      item.supplier_id,
                selectedSupplier,
                current_stock,
                data_tonase:   item.data_tonase  || "",
                data_harga:    item.data_harga   || "",
                data_total:    item.data_total   || "",
                pembayaran_st: item.pembayaran_st || "cash",
              };
            })
          );

          return [built, supMap];
        })();

        setRows(processedRows);
        setSupplierOptionsByIndex(supplierMap);

        toast.update(toastId, {
          render: "Data berhasil dimuat!",
          type: "success",
          isLoading: false,
          autoClose: 3000,
        });
      } catch (err) {
        toast.update(toastId, {
          render: `Error: ${err.message}`,
          type: "error",
          isLoading: false,
          autoClose: 5000,
        });
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pengiriman_id, isOpen]);

  // ── Row handlers ─────────────────────────────────────────────────────────

  const handleAddRow = useCallback(() => {
    setRows((prev) => [...prev, emptyRow()]);
  }, []);

  const handleRemoveRow = useCallback((index) => {
    setRows((prev) => prev.filter((_, i) => i !== index));
    setSupplierOptionsByIndex((prev) => {
      const next = { ...prev };
      delete next[index];
      // Re-key entries above removed index
      return Object.fromEntries(
        Object.entries(next).map(([k, v]) => [k > index ? k - 1 : k, v])
      );
    });
  }, []);

  const handleTypeChange = useCallback(
    async (index, tipe) => {
      // Kick off lazy fetch immediately
      fetchBarangByType(tipe);

      setRows((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          barang_tipe:    tipe,
          barang_id:      null,
          selectedBarang: null,
          supplier_id:    null,
          selectedSupplier: null,
          current_stock:  0,
        };
        return next;
      });
      setSupplierOptionsByIndex((prev) => ({ ...prev, [index]: [] }));
    },
    [fetchBarangByType]
  );

  const handleBarangChange = useCallback(
    async (index, selected) => {
      setRows((prev) => {
        const next = [...prev];
        next[index] = {
          ...next[index],
          barang_id:        selected?.value ?? null,
          selectedBarang:   selected,
          supplier_id:      null,
          selectedSupplier: null,
          current_stock:    0,
        };
        return next;
      });

      if (selected?.value) {
        // Show loading state for supplier dropdown
        setSupplierOptionsByIndex((prev) => ({ ...prev, [index]: [] }));
        const { supplierOptions } = await fetchStock(selected.value);
        setSupplierOptionsByIndex((prev) => ({ ...prev, [index]: supplierOptions }));
      } else {
        setSupplierOptionsByIndex((prev) => ({ ...prev, [index]: [] }));
      }
    },
    [fetchStock]
  );

  const handleSupplierChange = useCallback(
    (index, selected) => {
      setRows((prev) => {
        const next = [...prev];
        const barangId = next[index].barang_id;
        let current_stock = 0;

        if (selected && barangId && stockCacheRef.current[barangId]) {
          const entry = stockCacheRef.current[barangId].stockData.find(
            (s) => s.suplier_id === selected.value
          );
          if (entry) current_stock = entry.stok;
        }

        next[index] = {
          ...next[index],
          supplier_id:      selected?.value ?? null,
          selectedSupplier: selected,
          current_stock,
        };
        return next;
      });
    },
    []
  );

  const handleInputChange = useCallback((index, e) => {
    const { name, value } = e.target;
    setRows((prev) => {
      const next    = [...prev];
      const updated = { ...next[index], [name]: value };

      if (name === "data_tonase" || name === "data_harga") {
        updated.data_total =
          Number(name === "data_tonase" ? value : updated.data_tonase || 0) *
          Number(name === "data_harga"  ? value : updated.data_harga  || 0);
      }

      next[index] = updated;
      return next;
    });
  }, []);

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      const toastId = toast.loading("Menyimpan data...");
      try {
        const res = await api.post(
          "/edit-Pengiriman",
          {
            pengiriman_id,
            pengirimanData: { id: pengiriman_id, pengiriman_tgl, nama_pembeli, uang_muka, status },
            formData: rows.map(({ id, barang_id, data_tonase, data_harga, data_total, pembayaran_st, supplier_id }) => ({
              id, barang_id, data_tonase, data_harga, data_total, pembayaran_st, supplier_id,
            })),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
              Accept: "application/json",
            },
          }
        );

        if (res.status === 200) {
          toast.update(toastId, { render: "Berhasil disimpan!", type: "success", isLoading: false, autoClose: 3000 });
          onClose();
        } else {
          throw new Error(`HTTP ${res.status}`);
        }
      } catch (err) {
        toast.update(toastId, { render: `Error: ${err.message}`, type: "error", isLoading: false, autoClose: 5000 });
      }
    },
    [pengiriman_id, pengiriman_tgl, nama_pembeli, uang_muka, status, rows, token, onClose]
  );

  if (!isOpen) return null;

  const grandTotal = rows.reduce((sum, r) => sum + Number(r.data_total || 0), 0);

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 sm:p-6 font-poppins">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="bg-white w-full max-w-[1400px] h-full max-h-[95vh] rounded-2xl shadow-2xl relative z-10 flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex justify-between items-center p-5 md:px-8 border-b border-gray-100 bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-50 rounded-xl flex items-center justify-center text-teal-600">
              <i className="fa fa-truck text-lg" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 leading-tight">Ubah Pengiriman</h2>
              <p className="text-xs text-gray-500">Edit detail dan atur barang pengiriman</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
          >
            <i className="fa fa-times text-lg" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-5 md:px-8 bg-gray-50/30">

            {/* Header card */}
            <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm mb-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Tgl Pengiriman</label>
                <input
                  type="date"
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                  value={pengiriman_tgl}
                  onChange={(e) => setPengiriman_tgl(e.target.value)}
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Nama Pembeli</label>
                <div className="relative">
                  <i className="fa fa-user absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm" />
                  <input
                    type="text"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                    placeholder="Nama lengkap"
                    value={nama_pembeli}
                    onChange={(e) => setNama_pembeli(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Uang Muka</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-bold">Rp</span>
                  <input
                    type="number"
                    className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all"
                    placeholder="0"
                    value={uang_muka}
                    onChange={(e) => setUang_muka(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">Status Publish</label>
                <select
                  className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 focus:bg-white focus:ring-2 focus:ring-teal-100 focus:border-teal-400 outline-none transition-all cursor-pointer"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="yes">Yes (Publish)</option>
                  <option value="draft">Draft</option>
                </select>
              </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="overflow-x-auto min-h-[300px]">
                <table className="w-full text-left border-collapse min-w-[1200px]">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-200">
                      {["No","Tipe","Barang","Supplier","Stok","Tonase","Harga","Total","Pembayaran","Aksi"].map((h) => (
                        <th key={h} className="py-3 px-3 text-[11px] font-bold text-gray-500 uppercase tracking-wider border-r border-gray-200 last:border-r-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {rows.map((field, index) => (
                      <PengirimanRow
                        key={field.id ?? `new-${index}`}
                        field={field}
                        index={index}
                        isFirst={index === 0}
                        barangOptions={barangCacheRef.current[field.barang_tipe] || []}
                        supplierOptions={supplierOptionsByIndex[index] || []}
                        onTypeChange={handleTypeChange}
                        onBarangChange={handleBarangChange}
                        onSupplierChange={handleSupplierChange}
                        onInputChange={handleInputChange}
                        onRemove={handleRemoveRow}
                      />
                    ))}

                    {/* Grand total row */}
                    <tr className="bg-gray-100/80 border-t-2 border-gray-300">
                      <td colSpan="7" className="text-right py-3 px-4 text-sm font-bold text-gray-700 tracking-wider border-r border-gray-300">
                        GRAND TOTAL PENGIRIMAN
                      </td>
                      <td className="text-right py-3 px-3 text-sm font-bold text-red-600 border-r border-gray-200 bg-red-50/50">
                        {RupiahFormat(grandTotal)}
                      </td>
                      <td colSpan="2" />
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Add row button */}
            <div className="mt-4">
              <button
                type="button"
                onClick={handleAddRow}
                className="flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors shadow-sm"
              >
                <i className="fa fa-plus text-xs" /> Tambah Baris Pengiriman
              </button>
            </div>
          </div>

          {/* Footer */}
          <div className="p-5 md:px-8 bg-white border-t border-gray-100 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-teal-600 text-white rounded-lg text-sm font-semibold hover:bg-teal-700 transition-colors shadow-sm flex items-center gap-2"
            >
              <i className="fa fa-save" /> Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  FaMapMarkerAlt,
  FaSnowflake,
  FaUsers,
  FaBath,
  FaHome,
} from "react-icons/fa";

const FILTER_FIELDS = {
  AC: { key: "Ac / Non AC", value: "AC" },
  "Non AC": { key: "Ac / Non AC", value: "Non AC" },
  Private: { key: "Sharing Type", value: "Private" },
  Double: { key: "Sharing Type", value: "Double" },
  Triple: { key: "Sharing Type", value: "Triple" },
  Quad: { key: "Sharing Type", value: "Quad" },
  "Ghansoli": { key: "Location", value: "Ghansoli" },
  "CBD Belapur": { key: "Location", value: "CBD Belapur" },
  "Kopar Khairane": { key: "Location", value: "Kopar Khairane" },
  "Nerul ( E )": { key: "Location", value: "Nerul ( E )" },
  "Nerul ( W )": { key: "Location", value: "Nerul ( W )" },
  "Yes": { key: "Attached Bathroom", value: "yes" },
  "No": { key: "Attached Bathroom", value: "No" },
};

const PgDetails = () => {
  const [data, setData] = useState([]);
  const [filterTotal, setFilterTotal] = useState("");
  const [genderFilter, setGenderFilter] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [popup, setPopup] = useState(null);
  const [sortByVacatingDate, setSortByVacatingDate] = useState(false);
  const [selectedSheet] = useState("Jul2025");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(
          `https://gpgs-services.vercel.app/google-sheet?sheet=${selectedSheet}`
        );
        if (res.data.success) {
          setData(res.data.data);
          setShowContent(true);
        }
      } catch (err) {
        console.error("Failed to load data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedSheet]);

  const toggleFilter = (label) => {
    setActiveFilters((prev) =>
      prev.includes(label) ? prev.filter((f) => f !== label) : [...prev, label]
    );
  };

  const clearFilters = () => {
    setGenderFilter(null);
    setActiveFilters([]);
  };

  const filteredData = data
    .filter((item) => {
      if (item["Bed Available"]?.toLowerCase() !== "yes") return false;
      if (
        genderFilter &&
        item["Male / Female"]?.toLowerCase() !== genderFilter.toLowerCase()
      )
        return false;

      const groupedFilters = {};
      activeFilters.forEach((label) => {
        const field = FILTER_FIELDS[label]?.key;
        const value = FILTER_FIELDS[label]?.value;
        if (field && value) {
          groupedFilters[field] = [...(groupedFilters[field] || []), value];
        }
      });

      return Object.entries(groupedFilters).every(([field, values]) => {
        const itemValue = item[field]?.toString().toLowerCase();
        return values.some((val) => itemValue === val.toLowerCase());
      });
    })
    .sort((a, b) => {
      if (!sortByVacatingDate) return 0;

      const dateA = new Date(a["Client Vacating Date"]);
      const dateB = new Date(b["Client Vacating Date"]);
      return dateB - dateA; // descending
    });

  useEffect(() => {
    setFilterTotal(filteredData.length);
  }, [filteredData]);

  const uniqueLocations = [
    ...new Set(data.map((d) => d["Location"]).filter(Boolean)),
  ];

  const renderCheckboxList = (options) => (
    <div className="space-y-2">
      <div className="flex gap-3 mb-2">
        <button
          onClick={() =>
            setActiveFilters((prev) => [...new Set([...prev, ...options])])
          }
          className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
        >
          Select All
        </button>
        <button
          onClick={() =>
            setActiveFilters((prev) => prev.filter((f) => !options.includes(f)))
          }
          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
        >
          Clear All
        </button>
      </div>
      {options.map((label) => (
        <label key={label} className="block text-sm">
          <input
            type="checkbox"
            checked={activeFilters.includes(label)}
            onChange={() => toggleFilter(label)}
          />
          <span className="ml-2">{label}</span>
        </label>
      ))}
    </div>
  );

  const renderPopupContent = () => {
    switch (popup) {
      case "gender":
        return (
          <div className="space-y-2 text-sm">
            <label className="block">
              <input
                type="radio"
                name="gender"
                value="Male"
                checked={genderFilter === "Male"}
                onChange={() => setGenderFilter("Male")}
              />
              <span className="ml-2">Male</span>
            </label>
            <label className="block">
              <input
                type="radio"
                name="gender"
                value="Female"
                checked={genderFilter === "Female"}
                onChange={() => setGenderFilter("Female")}
              />
              <span className="ml-2">Female</span>
            </label>
          </div>
        );
      case "location":
        return renderCheckboxList(uniqueLocations);
      case "ac":
        return renderCheckboxList(["AC", "Non AC"]);
      case "sharing":
        return renderCheckboxList(["Private", "Double", "Triple", "Quad"]);
      case "bathroom":
        return renderCheckboxList(["Yes", "No"]);
      default:
        return null;
    }
  };

  const filterButtons = [
    { id: "gender", icon: <FaUsers />, label: "Gender" },
    { id: "location", icon: <FaMapMarkerAlt />, label: "Location" },
    { id: "ac", icon: <FaSnowflake />, label: "AC" },
    { id: "sharing", icon: <FaHome />, label: "Sharing" },
    { id: "bathroom", icon: <FaBath />, label: "Attached Bathroom" },
  ];

  if (loading)
    return (
      <p className="text-center text-orange-200 mt-10 text-4xl">
        Please wait...
      </p>
    );

  return (
    <div className="min-h-screen bg-gray-100 p-4 font-sans">
      <div className="sticky top-0 z-50 bg-gray-100 pb-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute top-2 left-0 w-[250px]">
            <img
              src="https://gpgs.in/wp-content/themes/paying_guest/images/logo.png"
              alt="Logo"
            />
          </div>
        </div>

        {showContent && (
          <div className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center gap-4">
            {filterButtons.map((btn) => {
              let selectedOptions = [];

              if (btn.id === "gender" && genderFilter) {
                selectedOptions = [genderFilter];
              } else if (btn.id === "location") {
                selectedOptions = activeFilters.filter(
                  (label) => FILTER_FIELDS[label]?.key === "Location"
                );
              } else if (btn.id === "ac") {
                selectedOptions = activeFilters.filter(
                  (label) => FILTER_FIELDS[label]?.key === "Ac / Non AC"
                );
              } else if (btn.id === "sharing") {
                selectedOptions = activeFilters.filter(
                  (label) => FILTER_FIELDS[label]?.key === "Sharing Type"
                );
              } else if (btn.id === "bathroom") {
                selectedOptions = activeFilters.filter(
                  (label) =>
                    FILTER_FIELDS[label]?.key === "Attached Bathroom"
                );
              }

              return (
                <div
                  key={btn.id}
                  className="relative w-full sm:w-auto"
                  onMouseEnter={() => setPopup(btn.id)}
                  onMouseLeave={() => setPopup(null)}
                >
                  <button className="flex items-center justify-between w-full sm:justify-center gap-2 px-4 py-1 border border-orange-500 text-orange-600 bg-white rounded-xl hover:bg-orange-50 shadow-sm transition-all">
                    {btn.icon}
                    <span className="font-medium">{btn.label}</span>
                  </button>

                  {popup === btn.id && (
                    <div className="absolute top-6.5 left-0 z-50 bg-white border border-orange-300 shadow-lg rounded-xl p-4 w-64 mt-2">
                      <h2 className="text-sm text-orange-500 font-bold mb-3 capitalize">
                        {btn.label} Filter
                      </h2>
                      {renderPopupContent()}
                    </div>
                  )}

                  {selectedOptions.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1 text-xs">
                      {selectedOptions.map((opt) => (
                        <span
                          key={opt}
                          className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full flex items-center gap-1"
                        >
                          {opt}
                          <button
                            onClick={() => {
                              if (btn.id === "gender") {
                                setGenderFilter(null);
                              } else {
                                toggleFilter(opt);
                              }
                            }}
                            className="ml-1 font-bold text-xs text-orange-500 hover:text-red-500"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}


            {activeFilters.length > 0 && (
              <button className="flex items-center justify-between h-8 sm:justify-center gap-2 px-4 py-1 border border-orange-500 text-orange-600 bg-white rounded-xl hover:bg-orange-50 shadow-sm transition-all">
                <span
                  className="font-medium text-red-500"
                  onClick={() => clearFilters()}
                >
                  Clear Filters
                </span>
              </button>
            )}
                <div className="flex items-center justify-end mt-2 mb-2 gap-2">
        <label className="text-sm text-orange-600">
          Sort by CVD
        </label>
        <button
          onClick={() => setSortByVacatingDate((prev) => !prev)}
          className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${
            sortByVacatingDate ? "bg-orange-500" : "bg-gray-300"
          }`}
        >
          <div
            className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
              sortByVacatingDate ? "translate-x-6" : "translate-x-0"
            }`}
          />
        </button>
      </div>
          </div>
        )}
      </div>

      {/* Vacating Date Switch */}
  

      <div className="max-w-full mx-auto mt-4">
        {filteredData.length === 0 ? (
          <p className="text-gray-500 text-center py-10">
            No records found for selected filters.
          </p>
        ) : (
          <>
            {filterTotal > 0 && (
              <div className="text-end text-sm text-gray-600 mb-1">
                Showing{" "}
                <span className="font-semibold text-orange-600">
                  {filterTotal}
                </span>{" "}
                result(s)
              </div>
            )}

            <div className="overflow-auto max-h-screen rounded-xl border border-gray-200">
              <table className="min-w-[1000px] w-full text-sm text-left text-gray-700">
                <thead className="sticky top-0 bg-orange-300 z-10 shadow-md text-gray-800 text-base">
                  <tr>
                    {Object.keys(filteredData[0] || {}).map((key, idx) => (
                      <th
                        key={key}
                        className={`px-4 py-3 border-b border-gray-300 whitespace-nowrap font-semibold bg-orange-300 ${
                          idx === 0
                            ? "sticky left-0 z-20 bg-orange-300"
                            : idx === 1
                            ? "sticky left-[80px] z-20 bg-orange-300"
                            : ""
                        }`}
                        style={{
                          minWidth: "150px",
                        }}
                      >
                        {key === 1 ? "Sr.No." : key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    <tr
                      key={index}
                      className="even:bg-orange-50 hover:bg-orange-100 transition-all border-b border-gray-200"
                    >
                      {Object.keys(filteredData[0] || {}).map((key, idx) => (
                        <td
                          key={idx}
                          className={`px-4 py-3 text-[15px] align-top whitespace-nowrap ${
                            idx === 0
                              ? "sticky left-0 bg-orange-50"
                              : idx === 1
                              ? "sticky left-[80px] bg-orange-50"
                              : ""
                          }`}
                          style={{
                            minWidth: "150px",
                          }}
                        >
                          {item[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PgDetails;

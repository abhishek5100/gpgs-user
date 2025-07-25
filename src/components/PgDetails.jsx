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
  const [filterTotal , setFilterTotal] = useState("")
  const [genderFilter, setGenderFilter] = useState(null);
  const [activeFilters, setActiveFilters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showContent, setShowContent] = useState(false);
  const [popup, setPopup] = useState(null);
  const [selectedSheet] = useState("Jul2025");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await axios.get(`http://localhost:3000/google-sheet?sheet=${selectedSheet}`);
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

  const filteredData = data.filter((item) => {

    if (item["Bed Available"]?.toLowerCase() !== "yes") {
      return false;
    }

    if (genderFilter && item["Male / Female"]?.toLowerCase() !== genderFilter.toLowerCase()) {
      return false;
    }


    const groupedFilters = {};
    activeFilters.forEach((label) => {
      const field = FILTER_FIELDS[label]?.key;
      const value = FILTER_FIELDS[label]?.value;
      // console.log("field" , field)
      // console.log("value" , value)
      if (field && value) {
        groupedFilters[field] = [...(groupedFilters[field] || []), value];
      }
    });

       
    return Object.entries(groupedFilters).every(([field, values]) => {
      const itemValue = item[field]?.toString().toLowerCase();
      return values.some((val) => itemValue === val.toLowerCase());
    });
  });

useEffect(()=>{
     setFilterTotal(filteredData.length)
},[filteredData])



  const uniqueLocations = [...new Set(data.map((d) => d["Location"]).filter(Boolean))];

  const renderCheckboxList = (options) => (
    <div className="space-y-2">
      <div className="flex gap-3 mb-2">
        <button
          onClick={() => setActiveFilters((prev) => [...new Set([...prev, ...options])])}
          className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded hover:bg-green-200"
        >
          Select All
        </button>
        <button
          onClick={() => setActiveFilters((prev) => prev.filter((f) => !options.includes(f)))}
          className="text-xs bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
        >
          Clear All
        </button>
      </div>
      {options.map((label) => (
        <label key={label} className="block">
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
          <div className="space-y-2">
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
        return renderCheckboxList(["Yes" , "No"]);
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

  if(loading) return <p className="text-center text-orange-200 mt-10 text-4xl">loading.....</p>
  return (
    <div className="min-h-screen bg-gray-100 p-6 font-sans">
      <div className="sticky top-0 z-50 bg-gray-100 pb-4">
        <div className="relative flex items-center justify-center mb-4">
          <div className="absolute top-2 left-0 w-[300px]">
            <img src="https://gpgs.in/wp-content/themes/paying_guest/images/logo.png" alt="Logo" />
          </div>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-4 mb-4">
          {activeFilters.length > 0 && (
            <button
              onClick={clearFilters}
              className="border border-orange-600 text-orange-600 px-6 py-2 rounded-lg hover:bg-orange-50"
            >
              Clear Filters
            </button>
          )}
        </div>

        {showContent && (
          <div className="flex flex-wrap justify-center gap-3">
            {filterButtons.map((btn) => (
              <div
                key={btn.id}
                className="relative"
                onMouseEnter={() => setPopup(btn.id)}
                onMouseLeave={() => setPopup(null)}
              >
                <button className="flex items-center gap-2 px-4 py-2 border rounded-lg text-orange-600 border-orange-600 bg-white hover:bg-orange-50">
                  {btn.icon} {btn.label}
                </button>
                {popup === btn.id && (
                  <div className="absolute top-full left-0 z-50 bg-white border border-orange-500 shadow rounded-lg p-4 w-56">
                    <h2 className="text-sm text-orange-500 font-bold mb-2 capitalize">{btn.label} Filter</h2>
                    {renderPopupContent()}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <h1>{filterTotal}</h1>
      </div>

      

      <div className="max-w-full mx-auto">
        {filteredData.length === 0 ? (
          <p className="text-gray-500 text-center py-10">No records found for selected filters.</p>
        ) : (
          <div className="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.08)] mb-5">
            <div className="overflow-x-auto rounded-lg max-h-[600px]">
              <table className="min-w-full table-auto border-collapse text-sm text-left text-gray-800">
                <thead className="bg-orange-200 text-gray-700">
                  <tr>
                    {/* <th className="px-4 py-2 border border-gray-300 sticky top-0 bg-orange-300 text-lg font-semibold z-10">
                      #
                    </th> */}
                    {Object.keys(filteredData[0] || {}).map((key) => (
                      <th
                        key={key}
                        className="px-4 py-2 border border-gray-300 sticky top-0 bg-orange-300 text-lg font-semibold whitespace-nowrap z-10"
                      >
                        {key}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.map((item, index) => (
                    
                    <tr
                      key={index}
                      className="hover:bg-gray-50 even:bg-gray-50 border border-gray-200"
                    >
                      {/* <td className="px-4 py-3 border-b font-medium">{index + 1}</td> */}
                      {Object.keys(filteredData[0] || {}).map((key, idx) => (
                        <td key={idx} className="px-4 py-3 text-[17px] border-b align-top">
                          {item[key]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PgDetails;

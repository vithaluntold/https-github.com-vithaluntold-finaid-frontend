import { Axios } from "axios";
import classNames from "./custom.module.scss";

import { IoMdArrowDropdown, IoMdArrowDropup } from "react-icons/io";
import { useEffect, useRef, useState } from "react";

export const EachCustomDropdown = ({
  title,
  dropdown,
  name,
  stateValue,
  setState,
  typee,
  placeholder,
  indexValue,
  objName,
  mapName,
  option,
  currentValue,
  indexx,
  asteriskIconn,
  typeee,
  noopen,
  selectedEmployee,
  allEmployees,
  refreshPage,
  apiVal,
  setLocalRefresh,
  mapNameType,
  isAlreadyThere,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [otherSubCards, setOtherSubCards] = useState({});
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        !dropdownRef?.current?.contains(event?.target) &&
        !inputRef?.current?.contains(event?.target)
      ) {
        setIsOpen(false);
      }
    };

    const handleDocumentClick = (event) => {
      handleClickOutside(event);
    };

    document.addEventListener("click", handleDocumentClick);

    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  const selectOption = (option) => {
    setSelectedOption(option);
    setIsOpen(false);
    // Perform any additional actions based on the selected option
  };

  //function

  async function updateRoleCosting(obj) {
    try {
      let response = await Axios.put(
        `https://coverfi.apimachine.com/api/v1/raha-lead/mapping/update/${apiVal}`,
        obj
      );
      setLocalRefresh((prev) => !prev);
      if (response?.data?.status) {
        // predefinedToast("Updated role...");
      }
    } catch (error) {
      console.log(error?.message, "Update role costing error");
    }
  }

  const toggleSelectionMultiple = (field, value) => {
    setState((prevState) => {
      const currentFieldValues = prevState[field] || [];
      const updatedValues = currentFieldValues.includes(value)
        ? currentFieldValues.filter((item) => item !== value) // Remove the value
        : [...currentFieldValues, value]; // Add the value

      setIsOpen(false);
      return {
        ...prevState,
        [field]: updatedValues,
      };
    });
  };

  //renderings

  useEffect(() => {
    if (isAlreadyThere) {
      setSelectedOption(stateValue[name]);
    }
  }, [isAlreadyThere]);

  return (
    <div
      className={classNames.eachCustomDropdown}
      style={{
        height: typee === "singleMultiple" ? "unset" : "",
      }}
    >
      <div
        className={classNames.inputContainer}
        onClick={toggleDropdown}
        style={{
          pointerEvents: dropdown?.length < 1 ? "none" : "",
          zIndex: isOpen ? "3" : "",
        }}
        ref={dropdownRef}
      >
        <span>
          <span>
            {mapName?.length > 0 && Array.isArray(mapName) && stateValue[name]
              ? ` ${
                  objName == "grade"
                    ? "Grade " + stateValue[name][objName]
                    : stateValue[name][mapName[objName]]
                }`
              : option === "alreadySet"
              ? name && indexx
                ? stateValue[name][indexx]
                : stateValue[name] === true
                ? "Applicable"
                : stateValue[name] === false
                ? "Not Applicable"
                : stateValue[name]
              : option === "checkValue" && stateValue[name]
              ? stateValue[name]
              : selectedOption
              ? selectedOption
              : title
              ? title
              : placeholder
              ? placeholder
              : "Select an option"}
          </span>
          <span
            style={{ visibility: typeee === "removeArrow" ? "hidden" : "" }}
          >
            {isOpen ? <IoMdArrowDropup /> : <IoMdArrowDropdown />}
          </span>
        </span>
        {isOpen && (
          <ul
            className="dropdown-list"
            style={{ height: typee === "addPolicyToAll" ? "50vh" : "" }}
          >
            <li
              style={{
                display:
                  dropdown?.length <= 4 || placeholder == "Relation"
                    ? "none"
                    : "",
              }}
            >
              <input
                ref={inputRef}
                type="text"
                placeholder="Search.."
                value={searchQuery}
                onChange={handleInputChange}
                onClick={(event) => event.stopPropagation()}
              />
            </li>
            {typee === "singleMultiple" && dropdown?.length > 0
              ? dropdown
                  ?.filter((row) => {
                    // Convert the row object values to an array and check if any value matches the search query
                    const searchQueryy = searchQuery?.toLowerCase(); // Convert the search query to lowercase for a case-insensitive search
                    return row?.toLowerCase()?.includes(searchQueryy);
                  })
                  ?.map((eachitem, index) => {
                    return (
                      <li
                        onClick={(event) => {
                          event.stopPropagation();
                          // selectOption(eachitem);
                          console.log(eachitem, "singleMultiple", name);

                          if (name) {
                            toggleSelectionMultiple(name, eachitem);
                          } else {
                            setState(eachitem);
                          }
                        }}
                        key={eachitem + index}
                        style={{
                          display: eachitem === stateValue ? "none" : "",
                        }}
                      >
                        {eachitem}
                      </li>
                    );
                  })
              : typee === "single" && dropdown?.length > 0
              ? dropdown
                  ?.filter((row) => {
                    // Convert the row object values to an array and check if any value matches the search query
                    const searchQueryy = searchQuery?.toLowerCase(); // Convert the search query to lowercase for a case-insensitive search
                    return row?.toLowerCase()?.includes(searchQueryy);
                  })
                  ?.map((eachitem, index) => {
                    return (
                      <li
                        onClick={(event) => {
                          event.stopPropagation();
                          selectOption(eachitem);
                          console.log(eachitem, "eachitem", name);

                          if (name) {
                            setState({
                              ...stateValue,
                              [name]: eachitem,
                            });
                            // setState((prev) => {
                            //   return { ...prev, [name]: eachitem };
                            // });
                          } else {
                            setState(eachitem);
                          }
                        }}
                        key={eachitem + index}
                        style={{
                          display: eachitem === stateValue ? "none" : "",
                        }}
                      >
                        {eachitem}
                      </li>
                    );
                  })
              : typee === "objVal" && dropdown?.length > 0
              ? dropdown
                  ?.filter((row) => {
                    // Convert the row object values to an array and check if any value matches the search query
                    const values = Object?.values(row);
                    const searchQueryy = searchQuery?.toLowerCase(); // Convert the search query to lowercase for a case-insensitive search

                    return values?.some((value) => {
                      if (typeof value === "string") {
                        return value?.toLowerCase()?.includes(searchQueryy);
                      }
                      return false;
                    });
                  })
                  ?.map((eachitem, index) => {
                    return (
                      <li
                        onClick={(event) => {
                          event.stopPropagation();
                          console.log(eachitem[mapName[0]]);
                          selectOption(
                            mapName?.length > 0 && Array.isArray(mapName)
                              ? mapName[0]
                              : mapName
                              ? eachitem[mapName]
                              : eachitem[objName]
                          );
                          if (mapName?.length > 0 && Array.isArray(mapName)) {
                            setState((prev) => {
                              return { ...prev, [name]: eachitem };
                            });
                          } else {
                            setState({
                              ...stateValue,
                              [name]: eachitem[objName],
                            });
                          }
                        }}
                        key={eachitem[objName] + index}
                        style={{
                          flexDirection:
                            mapNameType === "flex"
                              ? ""
                              : mapName?.length > 0 && Array.isArray(mapName)
                              ? "column"
                              : "",
                          alignItems:
                            mapName?.length > 0 && Array.isArray(mapName)
                              ? "flex-start"
                              : "",
                          gap: mapNameType === "flex" ? "4px" : "",
                          marginBottom: mapNameType === "flex" ? "0" : "",
                        }}
                      >
                        {/* <img src={eachitem} alt={eachitem} /> */}
                        {mapName?.length > 0 && Array.isArray(mapName)
                          ? mapName?.map((eachItem) => {
                              return (
                                <div key={eachitem[eachItem] + index}>
                                  {eachitem[eachItem]}
                                </div>
                              );
                            })
                          : mapName
                          ? eachitem[mapName]
                          : eachitem[objName]}
                      </li>
                    );
                  })
              : typee === "obj" && dropdown?.length > 0
              ? dropdown
                  ?.filter((row) => {
                    // Convert the row object values to an array and check if any value matches the search query
                    const values = Object?.values(row);
                    const searchQueryy = searchQuery?.toLowerCase(); // Convert the search query to lowercase for a case-insensitive search

                    return values?.some((value) => {
                      if (typeof value === "string") {
                        return value?.toLowerCase()?.includes(searchQueryy);
                      }
                      return false;
                    });
                  })
                  ?.map((eachitem, index) => {
                    return (
                      <li
                        onClick={(event) => {
                          event.stopPropagation();
                          selectOption(eachitem);
                          setState({
                            ...stateValue,
                            [name]: eachitem,
                          });
                        }}
                        key={eachitem + index}
                      >
                        <img src={eachitem} alt={eachitem} />
                        {eachitem}
                      </li>
                    );
                  })
              : dropdown?.length > 0 &&
                dropdown
                  ?.filter((row) => {
                    // Convert the row object values to an array and check if any value matches the search query
                    const values = Object?.values(row);
                    const searchQueryy = searchQuery?.toLowerCase(); // Convert the search query to lowercase for a case-insensitive search

                    return values?.some((value) => {
                      if (typeof value === "string") {
                        return value?.toLowerCase()?.includes(searchQueryy);
                      }
                      return false;
                    });
                  })
                  ?.map((eachitem, index) => {
                    return (
                      <li
                        onClick={(event) => {
                          event.stopPropagation();
                          selectOption(eachitem?.app_name);
                          setState({
                            ...stateValue,
                            [name]: eachitem?.app_code,
                          });
                        }}
                        key={eachitem?.app_name + index}
                      >
                        <img
                          src={eachitem?.app_icon}
                          alt={eachitem?.app_name}
                        />
                        {eachitem?.app_name}
                      </li>
                    );
                  })}
            {/* {stateValue ? (
              <li
                onClick={(event) => {
                  event.stopPropagation();
                  selectOption("");
                  setState("");
                }}
                key={"allCompanies"}
              >
                All Companies
              </li>
            ) : (
              ""
            )} */}
          </ul>
        )}
      </div>
      <div className={classNames.allItems}>
        {typee === "singleMultiple" &&
          stateValue[name]?.length > 0 &&
          stateValue[name].map((eachItem, index) => {
            return <div key={eachItem + index}>{eachItem}</div>;
          })}
      </div>
    </div>
  );
};

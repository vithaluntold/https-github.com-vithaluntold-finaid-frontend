import React, { useEffect, useState } from "react";
import classNames from "./uploadsheet.module.scss";

//assets
import { useHistory } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { AiOutlineDownload } from "react-icons/ai";
import Papa from "papaparse";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { bouncy } from "ldrs";
import { parseCSVtoJSON } from "../../../assets/functions";

bouncy.register();

const SamSr = ({ selectedAgent }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [loadingMain, setLoadingMain] = useState(false);
  const [sampleFile, setSampleFile] = useState(null);
  const [uncategorizedData, setUncategorizedData] = useState(null);
  const [trainingDataWithLearning, setTrainingDataWithLearning] =
    useState(null);
  const [allChartOfAccounts, setAllChartOfAccounts] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]);
  const [allInputPredictions, setAllInputPredictions] = useState([]);
  const [allInputs, setAllInputs] = useState([]);
  const [allOutputs, setAllOutputs] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState({});
  const [selectedInput, setSelectedInput] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [executeStep, setExecuteStep] = useState(1); //default 1
  const [withoutLearning, setWithoutLearning] = useState(""); //default 1
  const [regenerateIndex, setRegenerateIndex] = useState(1); //default 1

  //functions

  const handleRemoveFile = (indexToRemove, setState, stateValue) => {
    const updatedFiles = stateValue.filter(
      (_, index) => index !== indexToRemove
    );
    setState(updatedFiles);
  };

  const handleDelete = (indexToRemove) => {
    setAllChartOfAccounts((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleUploadSamSR = async (
    sampleFileStraight,
    payeeFile,
    learningData
  ) => {
    setLoading(true);
    setLoadingMain(true);
    // Create a File object from the Blob

    if (!sampleFileStraight || !payeeFile) {
      alert("Please provide both payee & sample data!");
      setLoading(false);
      setLoadingMain(false);
      return;
    }

    const formData = new FormData();
    if (learningData) {
      formData.append("file_learning", learningData);
    }
    formData.append("file_desc", sampleFileStraight);
    formData.append("file_payee", payeeFile);

    try {
      const response = await axios.post(
        "https://finaid2.accountants.io/api/pl-statements/generate",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(response, "response from handleSamJR");

      if (response?.status) {
        toast.success("Successfully processed the uncategorized data!");

        const newOutput1 = {
          predictions: parseCSVtoJSON(response?.data?.output),
          fileName: `output_${regenerateIndex}` + sampleFileStraight?.name,
        };
        const newOutput2 = {
          predictions: parseCSVtoJSON(response?.data?.pl_statement),
          fileName:
            `pl_statement_${regenerateIndex}` + sampleFileStraight?.name,
        };

        setAllOutputs((prev) => [...prev, newOutput1, newOutput2]);
        setSelectedTransaction(newOutput1); // Select the latest uploaded file
        setAllPredictions(parseCSVtoJSON(response?.data?.output)); // Update allPredictions with the latest result
        setRegenerateIndex((prev) => prev + 1);
      } else {
        setAllPredictions([]);
        toast.error("Unable to predict data with the file attached!");
      }
      // console.log(response, "handleUploadTrainingDataWithoutLearning response");

      setLoading(false);
      setLoadingMain(false);
    } catch (error) {
      setLoading(false);
      setLoadingMain(false);
      setAllPredictions([]);
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  //functions

  function downloadCSV(data) {
    // Convert the data to CSV format
    const csvRows = [
      Object.keys(data[0]).join(","), // Header row
      ...data.map((row) => Object.values(row).join(",")), // Data rows
    ];
    const csvData = csvRows.join("\n");

    // Create a download link
    const blob = new Blob([csvData], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "transactions.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const transformCsvData = (file) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Dynamically map each row based on CSV headers
        const normalizedData = results.data.map((transaction) => {
          const formattedTransaction = {};
          Object.keys(transaction).forEach((key) => {
            formattedTransaction[key.trim()] = transaction[key] || "";
          });
          return formattedTransaction;
        });

        // Update the data state with the dynamically formatted data
        const newOutput = {
          predictions: normalizedData,
          fileName: file?.name,
        };
        console.log(normalizedData, "normalizedData", newOutput);
        setAllInputs((prevData) => {
          if (prevData?.length === 0) {
            setAllInputPredictions(normalizedData);
          }
          return [...prevData, newOutput];
        });
      },
      error: (error) => {
        console.error("Error parsing CSV file:", error);
      },
    });
  };

  return (
    <div className={classNames.uploadCsv}>
      <div className={classNames.leftContainer}>
        <div className={`${classNames.boxContainer} ${classNames.mainCard}`}>
          <div className={classNames.topCard}></div>
          <div className={classNames.bottomCard}>
            <img
              src={selectedAgent?.length > 0 && selectedAgent[0]?.profilePic}
              alt={selectedAgent?.length > 0 && selectedAgent[0]?.name}
            />
            <div
              className={classNames.closeBtn}
              onClick={() => history.goBack()}
            >
              Close
            </div>

            <div className={classNames.leftCard}>
              {executeStep >= 1 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 1: Upload your own expense categories
                    </div>
                    <label
                      htmlFor="uploadExpenseCategoriesSheet"
                      className={classNames.uploadBtn}
                    >
                      {sampleFile?.name ? sampleFile?.name : "Upload"}
                      <input
                        type="file"
                        id="uploadExpenseCategoriesSheet"
                        onChange={(e) => {
                          transformCsvData(e.target.files[0]);
                          setSampleFile(e.target.files[0]);
                          // handleOwnExpenseCategory(e.target.files[0]);
                        }}
                      />
                    </label>
                    <label
                      className={classNames.uploadBtn}
                      style={{ pointerEvents: "none", opacity: "0.35" }}
                    >
                      Generate for me
                    </label>
                  </div>
                  {Array.isArray(allChartOfAccounts) &&
                    allChartOfAccounts?.length > 0 && (
                      <div className={classNames.contentInput}>
                        <div className={classNames.title}>
                          Here are the categories from your spreadsheet
                        </div>
                        <div className={classNames.allAccounts}>
                          {allChartOfAccounts?.map((eachItem, index) => {
                            return (
                              <div key={eachItem + index}>
                                <div>{eachItem}</div>
                                <MdDelete onClick={() => handleDelete(index)} />
                              </div>
                            );
                          })}
                          <AddNewItem setState={setAllChartOfAccounts} />
                        </div>
                      </div>
                    )}
                  {executeStep === 1 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loading && classNames.notAllowed
                      }`}
                      // onClick={handleChatGPT}
                      onClick={() => setExecuteStep(2)}
                    >
                      {loading ? "Loading..." : "Next step"}
                    </div>
                  )}
                </>
              )}
              {executeStep >= 2 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 2: Upload training data
                    </div>
                    <label
                      htmlFor="trainingDataWithLearning"
                      className={`${classNames.uploadBtn} ${
                        withoutLearning === false && classNames.selectedOption
                      }`}
                    >
                      {trainingDataWithLearning?.name
                        ? trainingDataWithLearning?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="trainingDataWithLearning"
                        onChange={(e) => {
                          transformCsvData(e.target.files[0]);
                          setTrainingDataWithLearning(e.target.files[0]);
                          // handleUploadTrainingData(e.target.files[0]);
                          setWithoutLearning(false);
                          setExecuteStep(3);
                        }}
                      />
                    </label>
                    <label
                      htmlFor="trainingDataWithoutLearning"
                      className={`${classNames.uploadBtn} ${
                        withoutLearning === true && classNames.selectedOption
                      }`}
                      onClick={() => {
                        setWithoutLearning(true);
                        setExecuteStep(3);
                      }}
                    >
                      I have no training data
                    </label>
                  </div>
                  {/* {executeStep === 2 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loading && classNames.notAllowed
                      }`}
                      onClick={() => setExecuteStep(3)}
                    >
                      {loading ? "Loading..." : "Next Step"}
                    </div>
                  )} */}
                </>
              )}
              {executeStep >= 3 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 3: Upload your uncategorized data
                    </div>
                    <label
                      htmlFor="uncategorizedData"
                      className={`${classNames.uploadBtn} ${
                        withoutLearning === false && classNames.selectedOption
                      }`}
                    >
                      {uncategorizedData?.name
                        ? uncategorizedData?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="uncategorizedData"
                        onChange={(e) => {
                          transformCsvData(e.target.files[0]);
                          setUncategorizedData(e.target.files[0]);
                        }}
                      />
                    </label>
                  </div>
                  <div
                    className={`${classNames.submitBtn} ${
                      loading && classNames.notAllowed
                    }`}
                    onClick={() =>
                      // handleUploadUncategorizedData(
                      //   withoutLearning === true
                      //     ? "https://finaid.marketsverse.com/batch_predict_without_learning_file"
                      //     : "https://finaid.marketsverse.com/batch_predict_with_learning_file",
                      //   uncategorizedData
                      // )
                      handleUploadSamSR(
                        uncategorizedData,
                        sampleFile,
                        trainingDataWithLearning
                      )
                    }
                  >
                    {loading ? "Loading..." : "Next Step"}
                  </div>
                </>
              )}
              {loadingMain && (
                <div className={classNames.mainLoading}>
                  <l-bouncy
                    size="75"
                    speed="1.75"
                    color="var(--light-green-color)"
                  ></l-bouncy>
                </div>
              )}
            </div>
            <div className={classNames.allCards}>
              <div className={classNames.outputCard}>
                <div className={classNames.title}>Input Sheets</div>
                <div className={classNames.allDocs}>
                  {allInputs?.map((eachFile, index) => (
                    <div
                      className={
                        selectedInput?.fileName === eachFile?.fileName
                          ? classNames.selectedTab
                          : ""
                      }
                      key={eachFile?.fileName + index}
                      onClick={() => {
                        setSelectedInput(eachFile); // Set selected file
                        setAllInputPredictions(eachFile.predictions); // Update predictions
                      }}
                    >
                      <span>{eachFile?.fileName}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the onClick of parent
                          handleRemoveFile(index, setAllInputs, allInputs);
                          setSelectedInput(eachFile);
                        }}
                      >
                        <IoIosClose />
                      </span>
                    </div>
                  ))}
                </div>
                {allInputPredictions?.length > 0 && (
                  <div className={classNames.allOptions}>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={classNames.searchContainer}
                    />
                    <div className={classNames.btnsContainer}>
                      <div
                        className={classNames.downloadBtn}
                        onClick={() => {
                          downloadCSV(allInputPredictions);
                        }}
                      >
                        <AiOutlineDownload />
                        <span>Download</span>
                      </div>
                    </div>
                  </div>
                )}
                <div
                  className={classNames.eachDoc}
                  style={{ pointerEvents: "none" }}
                >
                  {allInputPredictions.length > 0 && (
                    <TransactionsTable
                      data={allInputPredictions}
                      setData={setAllInputPredictions}
                      searchTerm={searchTerm}
                    />
                  )}
                </div>
              </div>
              {/* output */}
              <div className={classNames.outputCard}>
                <div className={classNames.title}>Outputs</div>
                <div className={classNames.allDocs}>
                  {allOutputs?.map((eachFile, index) => (
                    <div
                      className={
                        selectedTransaction?.fileName === eachFile?.fileName
                          ? classNames.selectedTab
                          : ""
                      }
                      key={eachFile?.fileName + index}
                      onClick={() => {
                        setSelectedTransaction(eachFile); // Set selected file
                        setAllPredictions(eachFile.predictions); // Update predictions
                      }}
                    >
                      <span>{eachFile?.fileName}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the onClick of parent
                          handleRemoveFile(index, setAllOutputs, allOutputs);
                          setSelectedTransaction(eachFile);
                        }}
                      >
                        <IoIosClose />
                      </span>
                    </div>
                  ))}
                </div>
                {allPredictions?.length > 0 && (
                  <div className={classNames.allOptions}>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className={classNames.searchContainer}
                    />
                    <div className={classNames.btnsContainer}>
                      <div className={classNames.downloadBtn}>
                        <span
                          onClick={() =>
                            handleUploadSamSR(
                              uncategorizedData,
                              sampleFile,
                              trainingDataWithLearning
                            )
                          }
                        >
                          Regenerate output
                        </span>
                      </div>
                      <div
                        className={classNames.downloadBtn}
                        onClick={() => {
                          downloadCSV(allPredictions);
                        }}
                      >
                        <AiOutlineDownload />
                        <span>Download</span>
                      </div>
                    </div>
                  </div>
                )}
                <div className={classNames.eachDoc}>
                  {allPredictions.length > 0 && (
                    <TransactionsTable
                      data={allPredictions}
                      setData={setAllPredictions}
                      searchTerm={searchTerm}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamSr;

const TransactionsTable = ({ data, searchTerm, setData }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = 10;
  // const tableHeaders = ["Description", "Payee Category", "Vendor Name"];

  // // Normalizing function for mapping data keys to standard headers
  // const normalizeTransaction = (transaction) => ({
  //   Description: transaction.Description || transaction.description || "",
  //   "Payee Category":
  //     transaction["Payee Category"] || transaction.payee_category || "",
  //   "Vendor Name": transaction["Vendor Name"] || transaction.vendor_name || "",
  // });

  const [tableHeaders, setTableHeaders] = useState([]);

  useEffect(() => {
    // Extract headers dynamically from data if data is available
    if (data.length > 0) {
      const headers = Object.keys(data[0]).map((key) => key.trim());
      setTableHeaders(headers);
    }
  }, [data]);

  const normalizeTransaction = (transaction) => {
    const normalizedTransaction = {};
    tableHeaders.forEach((header) => {
      const lowerCaseKey = header.toLowerCase().replace(" ", "_");
      normalizedTransaction[header] =
        transaction[header] || transaction[lowerCaseKey] || "";
    });
    return normalizedTransaction;
  };

  const filteredData = data
    .map(normalizeTransaction)
    .filter((transaction) =>
      tableHeaders.some((key) =>
        String(transaction[key])
          .toLowerCase()
          .includes(searchTerm.toLowerCase())
      )
    );

  const pageCount = Math.ceil(filteredData.length / itemsPerPage);
  const displayedItems = filteredData.slice(
    currentPage * itemsPerPage,
    (currentPage + 1) * itemsPerPage
  );

  const handlePageClick = (event) => {
    setCurrentPage(event.selected);
  };

  const handleInputChange = (rowIndex, key, value) => {
    // Clone the data to avoid mutating the state directly
    const updatedData = [...data];
    const originalKey = key.toLowerCase().replace(" ", "_");
    updatedData[rowIndex][originalKey] = value;
    setData(updatedData);
  };

  console.log(data, "datadata");
  return (
    <div className={classNames.csvTable}>
      <div className={classNames.tableContainer}>
        <table>
          <thead>
            <tr>
              {tableHeaders.map((header, index) => (
                <th key={index}>{header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedItems.map((transaction, rowIndex) => (
              <tr key={rowIndex}>
                {tableHeaders.map((header, cellIndex) => (
                  <td key={cellIndex}>
                    <input
                      type="text"
                      value={transaction[header]}
                      onChange={(e) =>
                        handleInputChange(
                          rowIndex + currentPage * itemsPerPage,
                          header,
                          e.target.value
                        )
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ReactPaginate
        previousLabel={"Previous"}
        nextLabel={"Next"}
        breakLabel={"..."}
        pageCount={pageCount}
        marginPagesDisplayed={2}
        pageRangeDisplayed={5}
        onPageChange={handlePageClick}
        containerClassName={"pagination"}
        activeClassName={"activePagination"}
      />
    </div>
  );
};

const AddNewItem = ({ setState }) => {
  const [allVisible, setAddVisible] = useState(false);
  const [addItem, setAddItem] = useState("");
  return (
    <div style={{ flexDirection: "column", alignItems: "flex-start" }}>
      {allVisible && (
        <input
          className={classNames.inputField}
          type="text"
          value={addItem}
          placeholder="Enter chart of ai..."
          onChange={(event) => {
            setAddItem(event?.target?.value);
          }}
        />
      )}
      <div
        className={classNames.addNew}
        style={{ width: allVisible ? "max-content" : "" }}
        onClick={() => {
          if (allVisible) {
            setState((prev) => {
              return [...prev, addItem];
            });
            setAddVisible(false);
            setAddItem("");
          } else {
            setAddVisible(true);
          }
        }}
      >
        {allVisible ? "Add" : "Add New..."}
      </div>
    </div>
  );
};

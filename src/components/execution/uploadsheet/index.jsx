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
import { extractAccountList, parseCSVtoJSON } from "../../../assets/functions";

bouncy.register();

const UploadSheet = ({ selectedAgent }) => {
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
  const [generatePayees, setGeneratePayees] = useState(false); //default 1
  const [generatePayeesDetails, setGeneratePayeesDetails] = useState({}); //default 1

  //functions

  const handleRemoveFile = (indexToRemove, setState) => {
    const updatedFiles = allOutputs.filter(
      (_, index) => index !== indexToRemove
    );
    setState(updatedFiles);
  };

  const handleDelete = (indexToRemove) => {
    setAllChartOfAccounts((prev) =>
      prev.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleOwnExpenseCategory = async (sampleFileStraight) => {
    setLoading(true);
    // Create a File object from the Blob

    if (!sampleFileStraight) {
      alert("Please select both files");
      setLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append("payee_files", sampleFileStraight);

    try {
      const response = await axios.post(
        "https://finaid.marketsverse.com/upload_payee_data_files",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (
        response?.data?.payee_categories?.length > 0 &&
        Array.isArray(response?.data?.payee_categories)
      ) {
        setAllChartOfAccounts(response?.data?.payee_categories);
      } else {
      }
      console.log(response, "handleOwnExpenseCategory response");
      // if (response.ok) {
      //   const blob = await response.blob();
      //   const url = window.URL.createObjectURL(blob);
      //   setAllOutputs((prev) => {
      //     return [...prev, { fileName: sampleFile?.name, downloadURL: url }];
      //   });
      //   setSelectedTransaction({
      //     fileName: sampleFile?.name,
      //     downloadURL: url,
      //   });
      //   parseCSV(url);
      // } else {
      //   const errorResponse = await response.json();
      //   console.error("Error:", errorResponse.error);
      // }
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("There was a problem with the fetch operation:", error);
    }
  };

  const handleUploadSamJR = async (learningData, sampleFileStraight) => {
    setLoading(true);
    setLoadingMain(true);
    // Create a File object from the Blob

    if (!sampleFileStraight || !learningData) {
      alert("Please provide both learning & sample data!");
      setLoading(false);
      setLoadingMain(false);
      return;
    }

    const formData = new FormData();
    formData.append("file_learning", learningData);
    formData.append("file_sample", sampleFileStraight);

    try {
      const response = await axios.post(
        "https://finaid2.accountants.io/api/classifiers/generate",
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

        const newOutput = {
          predictions: parseCSVtoJSON(response?.data),
          fileName: sampleFileStraight?.name,
        };

        setAllOutputs((prev) => [...prev, newOutput]);
        setSelectedTransaction(newOutput); // Select the latest uploaded file
        setAllPredictions(parseCSVtoJSON(response?.data)); // Update allPredictions with the latest result
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

  const handleRegenerate = async () => {
    setLoadingMain(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",

          messages: [
            {
              role: "system",
              content: `
                            **Your name is Luca.**  
You are Luca, a finance expert. Always ask follow-up questions to gather all necessary details before providing answers.
luca shuould provide complete and accurate answer with all necessary details.
Luca asks one question at a time and explains why each question is necessary to narrow the scope efficiently.
Luca queries are structured to filter unnecessary steps (e.g., checking eligibility before diving into company incorporation.
Luca does not make assumptions about the user’s circumstances—she confirms eligibility and critical details every time.
Luca must ask follow-up questions at any point in a conversation before providing answers, ensuring the information is comprehensive and relevant to the user's situation and also give summary,guidance, for each steps.
Luca analyzes financial statements and tax documents to provide structured, actionable feedback. However, she avoids personal financial or legal advice, recommending consultations with professionals when appropriate.
 luca should answer the question by gathered into a precise, actionable summary once all relevant details are clarified.
 Luca responds patiently to confusion and uses playful remarks to keep conversations on track without pressure.
 Luca prioritizes narrowing answers efficiently by asking focused questions that help users achieve their objectives. Luca proactively identifies potential blockers and confirms critical details to avoid missteps.
 Luca ensures professionalism but may lighten conversations with situational humor where appropriate.

 Luca understands user frustrations—especially during stressful times like tax season—and offers humor to ease tension without sacrificing accuracy.
 Luca guidance remains fact-based, citing only government sources—never private firms or non-government organizations. Luca offers support only for the USA, UK, Canada, and India unless users explicitly request guidance for other jurisdictions.
  Luca only responds to queries directly related to finance, accounting, tax, or audit. She will ignore or reject any off-topic questions—even with polite or persistent user requests.
                                                `,
            },
            {
              role: "user",
              content: `Could you help design a Chart of Accounts for my business? We’re structured as a ${generatePayeesDetails?.business} in the ${generatePayeesDetails?.industry} sector. Our main revenue sources are ${generatePayeesDetails?.revenueSources}, and our primary expenses include ${generatePayeesDetails?.primaryExpenses}. We also have departments like [e.g., sales, R&D] that need individual tracking. For reporting, we need both internal KPIs like [list any specific KPIs] and compliance with external requirements such as [e.g., GAAP, IFRS, or tax guidelines]. We use [accounting software, e.g., QuickBooks, Xero], and if possible, we’d like integration with other systems like [e.g., inventory management or CRM]. Additionally, if you could design it with scalability in mind for future growth or new locations, that would be ideal.Our location would be ${generatePayeesDetails?.country}.Don't ask any other questions.Just give me a approximate list of chart of accounts as array of string`,
            },
          ],
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const botMessage = {
        role: "assistant",
        content: response.data.choices[0].message.content,
      };

      const accountList = extractAccountList(botMessage?.content);

      // console.log(response, "response");

      if (accountList?.length > 0) {
        setAllChartOfAccounts(accountList);
        setGeneratePayees(false);
        toast.success(
          "Successfully found the chart of accounts for your business"
        );
      } else {
        toast.error(
          "Unable to fetch the chart of accounts from the details provided, please give us little more details",
          { autoClose: false }
        );
      }
      setLoadingMain(false);
      console.log(accountList, "accountList");
      console.log(botMessage?.content, "response from luca");
    } catch (error) {
      console.error("Error:", error);
      setLoadingMain(false);
      toast.error(
        "There was an error regenerating your response. Please try again."
      );
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
                          handleOwnExpenseCategory(e.target.files[0]);
                        }}
                      />
                    </label>
                    {generatePayees && (
                      <>
                        <div
                          className={classNames.title}
                          style={{ marginTop: "1rem" }}
                        >
                          Provide us with details to generate chart of accounts
                        </div>
                        <div className={classNames.chatDetails}>
                          <input
                            type="text"
                            placeholder="Enter Industry"
                            onChange={(event) =>
                              setGeneratePayeesDetails((prev) => {
                                return {
                                  ...prev,
                                  industry: event?.target?.value,
                                };
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Enter Country"
                            onChange={(event) =>
                              setGeneratePayeesDetails((prev) => {
                                return {
                                  ...prev,
                                  country: event?.target?.value,
                                };
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Enter Business type"
                            onChange={(event) =>
                              setGeneratePayeesDetails((prev) => {
                                return {
                                  ...prev,
                                  business: event?.target?.value,
                                };
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Enter revenue sources"
                            onChange={(event) =>
                              setGeneratePayeesDetails((prev) => {
                                return {
                                  ...prev,
                                  revenueSources: event?.target?.value,
                                };
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Enter primary expenses"
                            onChange={(event) =>
                              setGeneratePayeesDetails((prev) => {
                                return {
                                  ...prev,
                                  primaryExpenses: event?.target?.value,
                                };
                              })
                            }
                          />
                        </div>
                        <div
                          className={classNames.generateBtn}
                          onClick={handleRegenerate}
                        >
                          Generate
                        </div>
                      </>
                    )}
                    <label
                      className={classNames.uploadBtn}
                      onClick={() => setGeneratePayees((prev) => !prev)}
                    >
                      {generatePayees ? "Close" : "Generate for me"}
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
                        }}
                      />
                    </label>
                    <label
                      htmlFor="trainingDataWithoutLearning"
                      className={`${classNames.uploadBtn} ${
                        withoutLearning === true && classNames.selectedOption
                      }`}
                      onClick={() => setWithoutLearning(true)}
                    >
                      I have no training data
                    </label>
                  </div>
                  {executeStep === 2 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loading && classNames.notAllowed
                      }`}
                      onClick={() => setExecuteStep(3)}
                    >
                      {loading ? "Loading..." : "Next Step"}
                    </div>
                  )}
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
                      handleUploadSamJR(
                        trainingDataWithLearning,
                        uncategorizedData
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
                          handleRemoveFile(index, setAllInputs);
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
                          downloadCSV(allPredictions);
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
                        selectedTransaction?.fileName + index ===
                        eachFile?.fileName + index
                          ? classNames.selectedTab
                          : ""
                      }
                      key={eachFile?.fileName + index}
                      onClick={() => {
                        setSelectedTransaction(eachFile); // Set selected file
                        setAllPredictions(eachFile.predictions); // Update predictions
                      }}
                    >
                      <span>{eachFile?.fileName + index}</span>
                      <span
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent triggering the onClick of parent
                          handleRemoveFile(index, setAllOutputs);
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
                            handleUploadSamJR(
                              trainingDataWithLearning,
                              uncategorizedData
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

export default UploadSheet;

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

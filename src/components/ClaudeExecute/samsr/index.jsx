import React, { useEffect, useState } from "react";
import classNames from "./uploadsheet.module.scss";

//assets
import { useHistory } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { AiOutlineDownload } from "react-icons/ai";
import * as XLSX from "xlsx";
import Papa from "papaparse";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { MdDelete } from "react-icons/md";
import { toast } from "react-toastify";
import { bouncy } from "ldrs";
import {
  convertCSVToJson,
  convertCSVToJsonFile,
  convertFileToJson,
  convertToCSV,
  extractAccountList,
  extractAccountNames,
  extractArrayFromResponse,
  extractJsonData,
  parseCSVtoJSON,
  parseTransactionsFromResponse,
  sendTransactionsInBatches,
} from "../../../assets/functions";
import {
  coaGenerateForMe,
  profitAndLossPrompt,
  promptlist,
  transactionSummaryPrompt,
  trialBalancePrompt,
} from "../../../assets/data";
import Anthropic from "@anthropic-ai/sdk";
// import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

bouncy.register();

const SamSRClaude = ({ selectedAgent }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [loadingMain, setLoadingMain] = useState(false);
  const [loadingOutput, setLoadingOutput] = useState({});
  const [allInputFiles, setAllInputFiles] = useState({});
  const [sampleFileJson, setSampleFileJson] = useState(null);
  const [allChartOfAccounts, setAllChartOfAccounts] = useState([]);
  const [allPredictions, setAllPredictions] = useState([]);
  const [allInputPredictions, setAllInputPredictions] = useState([]);
  const [allInputs, setAllInputs] = useState([]);
  const [allOutputs, setAllOutputs] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState({});
  const [selectedInput, setSelectedInput] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [executeStep, setExecuteStep] = useState(1); //default 1
  const [withoutLearning, setWithoutLearning] = useState("");
  const [generatePayees, setGeneratePayees] = useState(false);
  const [generatePayeesDetails, setGeneratePayeesDetails] = useState({});
  const [generatedIndex, setGeneratedIndex] = useState(1);
  const [allLucaMessages, setAllLucaMessages] = useState([]);
  const [profitAndLossCSV, setProfitAndLossCSV] = useState("");

  const anthropic = new Anthropic({
    apiKey: process.env.REACT_APP_ANTHROPIC_API_KEY, // Use environment variable
    dangerouslyAllowBrowser: true,
  });

  async function callAnthropic(message, type) {
    setLoadingMain(true);
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        system: promptlist,
        messages:
          type === "p&lStatement"
            ? [...allLucaMessages, message]
            : type === "trialBalance"
            ? [...allLucaMessages, message]
            : type === "withoutTrainingData"
            ? [
                ...allLucaMessages,
                {
                  role: "user",
                  content: `Now i am going to provide some data of uncategorized transactions for this business.Provide a complete list of all categorized transactions directly in the response without any summarization or previews, regardless of the size. Include all original columns along with the new columns: Chart of Transaction Particulars, Account, Account Category, Account Type, Statement,Financial impact and Transaction Partner.With given transaction amount & account class financial impact is amount converted to either positiver or negative when calculated with these conditions as asset with debit balance is positive number, liability with credit balance is positive, expenses with debit balance is negative & revenue with credit balance is positive.Don't need computed amount column in response. Present the response as csv, and ensure no data is omitted.`,
                },
                message,
              ]
            : [
                {
                  role: "user",
                  content: message,
                },
              ],
      });

      console.log(response, "response from anthropic");

      if (response?.content?.length > 0 && Array.isArray(response?.content)) {
        if (type === "Generate For Me") {
          const accountTable = extractArrayFromResponse(
            response?.content[0]?.text
          );
          const accountList = extractAccountNames(accountTable);

          console.log(response?.content, "response?.content");
          console.log(accountTable, "accountTable");
          console.log(accountList, "accountList");
          const payeeCSV = convertToCSV(accountTable);

          setAllLucaMessages((prev) => {
            return [
              ...prev,
              {
                role: "user",
                content: message,
              },
              {
                role: "assistant",
                content: response?.content[0]?.text,
              },
            ];
          });

          transformCsvData(payeeCSV);
          setAllInputFiles((prev) => {
            return { ...prev, payeeFile: payeeCSV };
          });
          setSampleFileJson(accountTable);

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

          console.log(accountList, "accountList");
        } else if (type === "uploadpayee") {
          const accountTable = extractArrayFromResponse(
            response?.content[0]?.text
          );
          const accountList = extractAccountNames(accountTable);

          console.log(response?.content, "response?.content");
          console.log(accountTable, "accountTable");
          console.log(accountList, "accountList");
          const payeeCSV = convertToCSV(accountTable);

          setAllLucaMessages((prev) => {
            return [
              ...prev,
              {
                role: "user",
                content: message,
              },
              {
                role: "assistant",
                content: response?.content[0]?.text,
              },
            ];
          });

          transformCsvData(payeeCSV);
          setAllInputFiles((prev) => {
            return { ...prev, payeeFile: payeeCSV };
          });
          setSampleFileJson(accountTable);

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

          console.log(accountList, "accountList");
        } else if (type === "withoutTrainingData") {
          const jsonArray = parseTransactionsFromResponse(
            response?.content[0]?.text
          );
          console.log(
            jsonArray,
            "jsonArray withoutTrainingData",
            response?.content[0]?.text
          );
          return jsonArray;
        } else if (type === "trialBalance") {
          const trialBalance = parseTransactionsFromResponse(
            response?.content[0]?.text
          );
          const newOutput = {
            predictions: trialBalance,
            fileName: `trial_balance` + allInputFiles?.uncategorizedFile?.name,
          };
          setGeneratedIndex((prev) => prev + 1);
          setAllOutputs((prev) => [...prev, newOutput]);
          setSelectedTransaction(newOutput); // Select the latest uploaded file
          setAllPredictions(trialBalance); // Update allPredictions with the latest result
          setLoadingMain(false);
          setLoadingOutput({});
          setExecuteStep(5);
          setAllLucaMessages((prev) => {
            return [
              ...prev,
              {
                role: "assistant",
                content: `Here is the trial balance output. ${JSON.stringify(
                  trialBalance
                )}`,
              },
            ];
          });
          console.log(response?.content, "Trial balance");
        } else if (type === "p&lStatement") {
          const profitAndLoss = extractArrayFromResponse(
            response?.content[0]?.text
          );
          setProfitAndLossCSV(response?.content[0]?.text);
          // const profitAndLoss = parseTransactionsFromResponse(
          //   response?.content[0]?.text
          // );
          const newOutput = {
            predictions: profitAndLoss,
            fileName: `P&L_Statement` + allInputFiles?.uncategorizedFile?.name,
          };
          setGeneratedIndex((prev) => prev + 1);
          setAllOutputs((prev) => [...prev, newOutput]);
          setSelectedTransaction(newOutput); // Select the latest uploaded file
          setAllPredictions(profitAndLoss); // Update allPredictions with the latest result
          setLoadingMain(false);
          setLoadingOutput({});
          // setExecuteStep(6);

          console.log(response?.content, "P&L statement output", profitAndLoss);
        }
      }

      setLoadingMain(false);
    } catch (error) {
      console.error("Error:", error);
      setLoadingMain(false);
      toast.error(
        "There was an error regenerating your response. Please try again."
      );
    }
  }

  //functions

  const handleRemoveFile = (indexToRemove, setState) => {
    const updatedFiles = allOutputs.filter(
      (_, index) => index !== indexToRemove
    );
    setState(updatedFiles);
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
                      {allInputFiles?.payeeFile?.name
                        ? allInputFiles?.payeeFile?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="uploadExpenseCategoriesSheet"
                        onChange={async (e) => {
                          // transformCsvData(e.target.files[0]);
                          let csvData = await convertCSVToJson(e);
                          // console.log(csvData, "csvData");
                          callAnthropic(
                            `With this data can you generate a chart of accounts for an company? ${JSON.stringify(
                              csvData
                            )}`,
                            "uploadpayee"
                          );
                          // setSampleFile(e.target.files[0]);
                          // handleOwnExpenseCategory(e.target.files[0]);
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
                          onClick={() => {
                            callAnthropic(
                              coaGenerateForMe(generatePayeesDetails),
                              "Generate For Me"
                            );
                          }}
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
                  {Array.isArray(extractAccountNames(sampleFileJson)) &&
                    extractAccountNames(sampleFileJson)?.length > 0 && (
                      <div className={classNames.contentInput}>
                        <div className={classNames.title}>
                          Here are the categories from your spreadsheet
                        </div>
                        <div className={classNames.allAccounts}>
                          {extractAccountNames(sampleFileJson)?.map(
                            (eachItem, index) => {
                              return (
                                <div key={eachItem + index}>
                                  <div>{eachItem}</div>
                                </div>
                              );
                            }
                          )}
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
                      {allInputFiles?.trainingFile?.name
                        ? allInputFiles?.trainingFile?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="trainingDataWithLearning"
                        onChange={(event) => {
                          transformCsvData(event.target.files[0]);
                          setAllInputFiles((prev) => {
                            return {
                              ...prev,
                              trainingFile: event.target.files[0],
                            };
                          });
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
                      {allInputFiles?.uncategorizedFile?.name
                        ? allInputFiles?.uncategorizedFile?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="uncategorizedData"
                        onChange={(event) => {
                          transformCsvData(event.target.files[0]);
                          setAllInputFiles((prev) => {
                            return {
                              ...prev,
                              uncategorizedFile: event.target.files[0],
                            };
                          });
                        }}
                      />
                    </label>
                  </div>
                  {executeStep === 3 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loading && classNames.notAllowed
                      }`}
                      onClick={async () => {
                        if (withoutLearning) {
                          const jsonData = await convertFileToJson(
                            allInputFiles?.uncategorizedFile
                          );

                          let allOutput;
                          if (withoutLearning) {
                            allOutput = await sendTransactionsInBatches(
                              jsonData,
                              callAnthropic,
                              setLoadingOutput
                            );

                            const newOutput = {
                              predictions: allOutput,
                              fileName:
                                `uncategorized_transaction_summary` +
                                allInputFiles?.uncategorizedFile?.name,
                            };
                            setGeneratedIndex((prev) => prev + 1);
                            setAllOutputs((prev) => [...prev, newOutput]);
                            setSelectedTransaction(newOutput); // Select the latest uploaded file
                            setAllPredictions(allOutput); // Update allPredictions with the latest result
                            setLoadingMain(false);
                            setLoadingOutput({});
                            setAllLucaMessages((prev) => {
                              return [
                                ...prev,
                                {
                                  role: "user",
                                  content: transactionSummaryPrompt,
                                },
                                {
                                  role: "user",
                                  content: JSON.stringify(jsonData),
                                },
                                {
                                  role: "assistant",
                                  content: `Here is the categorized transactions output. ${JSON.stringify(
                                    allOutput
                                  )}`,
                                },
                              ];
                            });
                            setExecuteStep(4);
                          }
                          // handleRegenerateSheetUpload(
                          //   `${jsonData}`,
                          //   "withoutTrainingData"
                          // );
                        }
                      }}
                    >
                      {loading ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )}
              {executeStep >= 4 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 4: Generate trial balance
                    </div>
                  </div>
                  {executeStep === 4 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loading && classNames.notAllowed
                      }`}
                      onClick={async () => {
                        callAnthropic(
                          {
                            role: "user",
                            content: trialBalancePrompt,
                          },
                          "trialBalance"
                        );
                      }}
                    >
                      {loading ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )}
              {executeStep >= 5 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 5: Generate P&L statement
                    </div>
                  </div>
                  {executeStep === 5 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loading && classNames.notAllowed
                      }`}
                      onClick={async () => {
                        callAnthropic(
                          {
                            role: "user",
                            content: profitAndLossPrompt,
                          },
                          "p&lStatement"
                        );
                      }}
                    >
                      {loading ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )}
              {loadingMain && (
                <div className={classNames.mainLoading}>
                  <l-bouncy
                    size="75"
                    speed="1.75"
                    color="var(--light-green-color)"
                  ></l-bouncy>
                  {loadingOutput?.total && (
                    <div className={classNames.loadingValue}>
                      <div>
                        {loadingOutput?.current}/{loadingOutput?.total}
                      </div>
                      categorzied...
                    </div>
                  )}
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
                <div className={classNames.eachDoc}>
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
                          onClick={async () => {
                            if (executeStep === 3) {
                              if (withoutLearning) {
                                const jsonData = await convertFileToJson(
                                  allInputFiles?.uncategorizedFile
                                );

                                let allOutput;
                                if (withoutLearning) {
                                  allOutput = await sendTransactionsInBatches(
                                    jsonData,
                                    callAnthropic,
                                    setLoadingOutput
                                  );

                                  const newOutput = {
                                    predictions: allOutput,
                                    fileName:
                                      `uncategorized_transaction_summary` +
                                      allInputFiles?.uncategorizedFile?.name,
                                  };
                                  setGeneratedIndex((prev) => prev + 1);
                                  setAllOutputs((prev) => [...prev, newOutput]);
                                  setSelectedTransaction(newOutput); // Select the latest uploaded file
                                  setAllPredictions(allOutput); // Update allPredictions with the latest result
                                  setLoadingMain(false);
                                  setLoadingOutput({});
                                  setAllLucaMessages((prev) => {
                                    return [
                                      ...prev,
                                      {
                                        role: "user",
                                        content: transactionSummaryPrompt,
                                      },
                                      {
                                        role: "user",
                                        content: JSON.stringify(jsonData),
                                      },
                                      {
                                        role: "assistant",
                                        content: `Here is the categorized transactions output. ${JSON.stringify(
                                          allOutput
                                        )}`,
                                      },
                                    ];
                                  });
                                  setExecuteStep(4);
                                }
                                // handleRegenerateSheetUpload(
                                //   `${jsonData}`,
                                //   "withoutTrainingData"
                                // );
                              }
                            } else if (executeStep === 4) {
                              callAnthropic(
                                {
                                  role: "user",
                                  content: trialBalancePrompt,
                                },
                                "trialBalance"
                              );
                            } else if (executeStep === 5) {
                              callAnthropic(
                                {
                                  role: "user",
                                  content: profitAndLossPrompt,
                                },
                                "p&lStatement"
                              );
                            }
                          }}
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
                  {Array.isArray(allPredictions) &&
                    allPredictions.length > 0 && (
                      <TransactionsTable
                        data={allPredictions}
                        setData={setAllPredictions}
                        searchTerm={searchTerm}
                      />
                    )}
                </div>
                {profitAndLossCSV && (
                  <div className={classNames.eachDoc}>
                    <FinancialTable data={profitAndLossCSV} />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamSRClaude;

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
        transaction[header] ?? transaction[lowerCaseKey] ?? "";
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

  useEffect(() => {
    setCurrentPage(0);
  }, data);

  // console.log(data, displayedItems, tableHeaders, "table");
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

const FinancialTable = ({ data: csvData }) => {
  // Parse CSV data
  const rows = csvData.split("\n").map((row) => row.split(","));

  // Format currency
  const formatCurrency = (value) => {
    const num = parseFloat(value);
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(num);
  };

  // Determine row indentation level
  const getIndentLevel = (row) => {
    if (row[0] === "Net Profit/Loss") return 0;
    if (row[2] === "") return 0;
    if (row[2].startsWith("Subtotal")) return 1;
    return 2;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-lg shadow">
      <div className="p-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left p-2" style={{ padding: "0.5rem" }}>
                  Account
                </th>
                <th className="text-right p-2" style={{ padding: "0.5rem" }}>
                  Amount
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.slice(1).map((row, index) => {
                const indentLevel = getIndentLevel(row);
                const paddingLeft = `${indentLevel * 1.5}rem`;
                const isSubtotal = row[2].startsWith("Subtotal");
                const isTotal = row[2] === "" || row[0] === "Net Profit/Loss";

                return (
                  <tr
                    key={index}
                    className={`
                      hover:bg-gray-50
                      ${isTotal ? "font-bold border-t border-gray-200" : ""}
                      ${isSubtotal ? "font-semibold" : ""}
                    `}
                  >
                    <td className="p-2" style={{ padding: "0.5rem" }}>
                      {row[2] || row[0]}
                    </td>
                    <td
                      className="text-right p-2"
                      style={{ padding: "0.5rem" }}
                    >
                      {formatCurrency(row[3])}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from "react";
import classNames from "./uploadsheet.module.scss";

//assets
import { useHistory } from "react-router-dom";
import { IoIosClose } from "react-icons/io";
import { AiOutlineDownload } from "react-icons/ai";
import ReactPaginate from "react-paginate";
import axios from "axios";
import { bouncy } from "ldrs";
import {
  convertCSVToJson,
  convertDataToCSVBuffer,
  csvDataToJson,
  csvDataToJsonWithFile,
  extractAccountNames,
  parseCsvToCustomFormat,
} from "../../../assets/functions";
import { finaidAgentsURL } from "../../../assets/data";
import { toast } from "react-toastify";
import { EachCustomDropdown } from "../../custom";
import {
  accountingStandards,
  businessDepartments,
  industries,
  primaryExpenses,
  revenueSources,
} from "../../../assets/data/allcategories";

bouncy.register();

const SamSuperSRBackend = ({ selectedAgent }) => {
  const history = useHistory();
  const [loadingMain, setLoadingMain] = useState(false);
  const [allCountries, setAllCountries] = useState([]);
  const [loadingOutput, setLoadingOutput] = useState({});
  const [allInputFiles, setAllInputFiles] = useState({});
  const [selectedTransactionInput, setSelectedTransactionInput] = useState({});
  const [allPredictionsInput, setAllPredictionsInput] = useState([]);
  const [sampleFileJson, setSampleFileJson] = useState(null);
  const [allPredictions, setAllPredictions] = useState([]);
  const [allInputPredictions, setAllInputPredictions] = useState([]);
  const [allOutputs, setAllOutputs] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState({});
  const [selectedInput, setSelectedInput] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [executeStep, setExecuteStep] = useState(1); //default 1
  const [withoutLearning, setWithoutLearning] = useState("");
  const [generatePayees, setGeneratePayees] = useState(false);
  const [generatePayeesDetails, setGeneratePayeesDetails] = useState({});
  const [profitAndLossCSV, setProfitAndLossCSV] = useState("");
  const [openingBalance, setOpeningBalance] = useState("");
  const [allOutputFiles, setAllOutputFiles] = useState({});

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

  async function getAPIResponseFileUpload(
    URL,
    file,
    name,
    fileName,
    nextStep,
    fileType
  ) {
    setLoadingMain(true);
    try {
      const response = await axios.post(URL, file, {
        headers: {
          "Content-Type": fileType ? fileType : "multipart/form-data",
        },
      });
      console.log(response, "Get API antrophic backend response");
      if (response?.data?.status === "success") {
        setAllOutputFiles((prev) => {
          return {
            ...prev,
            [fileName]: {
              predictions: response?.data[name],
              fileName,
              ...response?.data,
            },
          };
        });
        setSelectedTransaction({ predictions: response?.data[name], fileName });
        let predictionData = csvDataToJson(response?.data[name]);
        setAllPredictions(predictionData);
        setGeneratePayees(false);
        if (nextStep) {
          nextStep();
        }
      } else {
        toast.error("An error occurred on the server. Please try again.", {
          autoClose: false,
        });
        console.log(response, "Error while trying to fetch response!");
      }
      setLoadingMain(false);
      console.log(response, "all output files response");
    } catch (error) {
      toast.error("An error occurred on the server. Please try again.", {
        autoClose: false,
      });
      setLoadingMain(false);
      console.log(error, "Error from get API Response File Upload");
    }
  }

  async function getAllCountries() {
    try {
      let response = await axios.get(
        "https://comms.globalxchange.io/coin/vault/countries/data/get"
      );
      if (response?.data?.status) {
        setAllCountries(response?.data?.countries);
      }
      console.log(response, "country list");
    } catch (error) {
      console.log(error?.message, "Countries list");
    }
  }

  //renderings

  useEffect(() => {
    getAllCountries();
  }, []);

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
                      {allInputFiles?.payeeFile?.file?.name
                        ? allInputFiles?.payeeFile?.file?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="uploadExpenseCategoriesSheet"
                        onChange={async (event) => {
                          let file = event.target?.files[0];
                          let convertedData = await parseCsvToCustomFormat(
                            file
                          );
                          let predictionData = await csvDataToJsonWithFile(
                            file
                          );
                          setAllPredictionsInput(predictionData);
                          setAllInputFiles((prev) => {
                            return {
                              ...prev,
                              payeeFile: {
                                predictions: convertedData,
                                file: file,
                                fileName: file?.name,
                                ...file,
                              },
                            };
                          });
                          const formData = new FormData();
                          formData.append("file_categories", file);
                          getAPIResponseFileUpload(
                            `${finaidAgentsURL}/api/coa-generator/generate-csv`,
                            formData,
                            "csv_coa",
                            "fileUploadCOA"
                          );
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
                          <EachCustomDropdown
                            title="Industry"
                            dropdown={industries}
                            name="industry"
                            stateValue={generatePayeesDetails}
                            setState={setGeneratePayeesDetails}
                            typee="single"
                          />
                          <EachCustomDropdown
                            title="Country"
                            dropdown={allCountries}
                            name="country"
                            stateValue={generatePayeesDetails}
                            setState={setGeneratePayeesDetails}
                            typee="objVal"
                            objName="name"
                            mapName="name"
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
                          <EachCustomDropdown
                            title="Revenue sources"
                            dropdown={revenueSources}
                            name="revenueSources"
                            stateValue={generatePayeesDetails}
                            setState={setGeneratePayeesDetails}
                            typee="singleMultiple"
                          />
                          <EachCustomDropdown
                            title="Primary expenses"
                            dropdown={primaryExpenses}
                            name="primaryExpenses"
                            stateValue={generatePayeesDetails}
                            setState={setGeneratePayeesDetails}
                            typee="singleMultiple"
                          />
                          <EachCustomDropdown
                            title="Department"
                            dropdown={businessDepartments}
                            name="department"
                            stateValue={generatePayeesDetails}
                            setState={setGeneratePayeesDetails}
                            typee="singleMultiple"
                          />
                          <EachCustomDropdown
                            title="Standard"
                            dropdown={accountingStandards}
                            name="standard"
                            stateValue={generatePayeesDetails}
                            setState={setGeneratePayeesDetails}
                            typee="singleMultiple"
                          />
                          {/* <input
                            type="text"
                            placeholder="Enter Department"
                            onChange={(event) =>
                              setGeneratePayeesDetails((prev) => {
                                return {
                                  ...prev,
                                  department: event?.target?.value,
                                };
                              })
                            }
                          />
                          <input
                            type="text"
                            placeholder="Enter standard"
                            onChange={(event) =>
                              setGeneratePayeesDetails((prev) => {
                                return {
                                  ...prev,
                                  standard: event?.target?.value,
                                };
                              })
                            }
                          /> */}
                          <input
                            type="text"
                            placeholder="Enter compliance"
                            onChange={(event) =>
                              setGeneratePayeesDetails((prev) => {
                                return {
                                  ...prev,
                                  compliance: event?.target?.value,
                                };
                              })
                            }
                          />
                        </div>
                        <div
                          className={`${classNames.generateBtn} ${
                            !(
                              generatePayeesDetails?.industry &&
                              generatePayeesDetails?.country &&
                              generatePayeesDetails?.business &&
                              generatePayeesDetails?.revenueSources?.length >
                                0 &&
                              generatePayeesDetails?.primaryExpenses?.length >
                                0 &&
                              generatePayeesDetails?.department?.length > 0 &&
                              generatePayeesDetails?.standard?.length > 0 &&
                              generatePayeesDetails?.compliance
                            ) && classNames.notAllowed
                          }`}
                          onClick={() => {
                            getAPIResponseFileUpload(
                              `${finaidAgentsURL}/api/coa-generator/generate-desc`,
                              {
                                desc_business: generatePayeesDetails?.business,
                                desc_industry: generatePayeesDetails?.industry,
                                desc_revenue_sources:
                                  generatePayeesDetails?.revenueSources,
                                desc_primary_expenses:
                                  generatePayeesDetails?.primaryExpenses,
                                desc_departments:
                                  generatePayeesDetails?.department,
                                desc_standards: generatePayeesDetails?.standard,
                                desc_compliance:
                                  generatePayeesDetails?.compliance,
                                desc_country: generatePayeesDetails?.country,
                              },
                              "csv_coa",
                              "descUploadCOA",
                              null,
                              "application/json"
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
                        loadingMain && classNames.notAllowed
                      }`}
                      // onClick={handleChatGPT}
                      onClick={() => setExecuteStep(2)}
                    >
                      {loadingMain ? "Loading..." : "Next step"}
                    </div>
                  )}
                </>
              )}
              {/* {executeStep >= 2 && (
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
                        onChange={(event) => {}}
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
                        loadingMain && classNames.notAllowed
                      }`}
                      onClick={() => setExecuteStep(3)}
                    >
                      {loadingMain ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )} */}
              {executeStep >= 2 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 2: Upload your uncategorized data
                    </div>
                    <label
                      htmlFor="uncategorizedData"
                      className={`${classNames.uploadBtn} ${
                        withoutLearning === false && classNames.selectedOption
                      }`}
                    >
                      {allInputFiles?.uncategorizedFile?.file?.name
                        ? allInputFiles?.uncategorizedFile?.file?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="uncategorizedData"
                        onChange={async (event) => {
                          let file = event.target?.files[0];
                          let convertedData = await parseCsvToCustomFormat(
                            file
                          );
                          let predictionData = await csvDataToJsonWithFile(
                            file
                          );
                          setAllPredictionsInput(predictionData);
                          setAllInputFiles((prev) => {
                            return {
                              ...prev,
                              uncategorizedFile: {
                                predictions: convertedData,
                                file: file,
                                fileName: file?.name,
                                ...file,
                              },
                            };
                          });
                        }}
                      />
                    </label>
                    <label
                      htmlFor="trainingData"
                      className={`${classNames.uploadBtn} ${
                        withoutLearning === false && classNames.selectedOption
                      }`}
                    >
                      {allInputFiles?.trainingData?.file?.name
                        ? allInputFiles?.trainingData?.file?.name
                        : "Upload training data (optional)"}
                      <input
                        type="file"
                        id="trainingData"
                        onChange={async (event) => {
                          let file = event.target?.files[0];
                          let convertedData = await parseCsvToCustomFormat(
                            file
                          );
                          let predictionData = await csvDataToJsonWithFile(
                            file
                          );
                          setAllPredictionsInput(predictionData);
                          setAllInputFiles((prev) => {
                            return {
                              ...prev,
                              trainingData: {
                                predictions: convertedData,
                                file: file,
                                fileName: file?.name,
                                ...file,
                              },
                            };
                          });
                        }}
                      />
                    </label>
                    <label
                      className={`${classNames.uploadBtn}`}
                      onClick={() => {
                        window.open(
                          "https://insurance.apimachine.com/insurance/general/files/5f0d347d-b824-4377-b934-e23d417553f9.csv"
                        );
                      }}
                    >
                      Download Sample File
                    </label>
                  </div>
                  {executeStep === 2 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loadingMain && classNames.notAllowed
                      }`}
                      onClick={async () => {
                        let outputCOA = convertDataToCSVBuffer(
                          allOutputFiles?.fileUploadCOA?.predictions
                            ? allOutputFiles?.fileUploadCOA?.predictions
                            : allOutputFiles?.descUploadCOA?.predictions
                            ? allOutputFiles?.descUploadCOA?.predictions
                            : "",
                          "output_coa"
                        );
                        const formData = new FormData();
                        formData.append("file_coa", outputCOA);
                        formData.append(
                          "file_uncategorized_trx",
                          allInputFiles?.uncategorizedFile?.file
                        );
                        if (allInputFiles?.trainingData?.file) {
                          formData.append(
                            "file_training",
                            allInputFiles?.trainingData?.file
                          );
                        }
                        await getAPIResponseFileUpload(
                          `${finaidAgentsURL}/api/category-predictor/categorize-transactions/csv`,
                          formData,
                          "csv_categorized_trx",
                          "categorized_transaction",
                          () => setExecuteStep(3)
                        );
                      }}
                    >
                      {loadingMain ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )}
              {executeStep >= 3 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 3: Generate Trial Balance
                    </div>
                    {/* <label
                      htmlFor="trialBalance"
                      className={`${classNames.uploadBtn}`}
                    >
                      {allInputFiles?.financialImpact?.file?.name
                        ? allInputFiles?.financialImpact?.file?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="trialBalance"
                        onChange={async (event) => {
                          let file = event.target?.files[0];
                          let convertedData = await parseCsvToCustomFormat(
                            file
                          );
                          let predictionData = csvDataToJson(convertedData);
                          setAllPredictionsInput(predictionData);
                          setAllInputFiles((prev) => {
                            return {
                              ...prev,
                              financialImpact: {
                                predictions: convertedData,
                                file: file,
                                fileName: file?.name,
                                ...file,
                              },
                            };
                          });
                        }}
                      />
                    </label> */}
                  </div>
                  {executeStep === 3 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loadingMain && classNames.notAllowed
                      }`}
                      onClick={async () => {
                        // old when upload file
                        // const formData = new FormData();
                        // formData.append(
                        //   "file_aggregated",
                        //   allInputFiles?.financialImpact?.file
                        // );

                        // new with aggregated
                        // let uploadFile = convertDataToCSVBuffer(
                        //   allOutputFiles?.categorized_transaction
                        //     ?.csv_aggregated_trx,
                        //   "csv_aggregated_trx"
                        // );
                        // const formData = new FormData();
                        // formData.append("file_aggregated", uploadFile);

                        let obj = {
                          csv_aggregated_str:
                            allOutputFiles?.categorized_transaction
                              ?.csv_aggregated_trx,
                          predicted_column_names:
                            allOutputFiles?.categorized_transaction
                              ?.json_predicted_column_names,
                        };
                        await getAPIResponseFileUpload(
                          `${finaidAgentsURL}/api/sheet-functions/generate-financial-impact`,
                          obj,
                          "csv_aggregated_fi",
                          "trial_balance",
                          () => setExecuteStep(4),
                          "application/json"
                        );
                      }}
                    >
                      {loadingMain ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )}
              {executeStep >= 4 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 4: Generate Profit & Loss
                    </div>
                  </div>
                  {executeStep === 4 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loadingMain && classNames.notAllowed
                      }`}
                      onClick={async () => {
                        let uploadFile = convertDataToCSVBuffer(
                          allOutputFiles?.trial_balance?.csv_aggregated_fi,
                          "csv_aggregated_pl"
                        );
                        const formData = new FormData();
                        formData.append("file_aggregated_fi", uploadFile);
                        await getAPIResponseFileUpload(
                          `${finaidAgentsURL}/api/sheet-functions/generate-pl`,
                          formData,
                          "csv_pl_piv",
                          "profitAndLoss",
                          () => setExecuteStep(5)
                        );
                      }}
                    >
                      {loadingMain ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )}
              {executeStep >= 5 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 5: Generate Balance Sheet
                    </div>
                  </div>
                  {executeStep === 5 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loadingMain && classNames.notAllowed
                      }`}
                      onClick={async () => {
                        let uploadFile = convertDataToCSVBuffer(
                          allOutputFiles?.profitAndLoss?.csv_aggregated_pl,
                          "csv_aggregated_pl"
                        );
                        const formData = new FormData();
                        formData.append("file_aggregated_pl", uploadFile);
                        await getAPIResponseFileUpload(
                          `${finaidAgentsURL}/api/sheet-functions/generate-bs`,
                          formData,
                          "csv_bs_piv",
                          "balanceSheet",
                          () => setExecuteStep(6)
                        );
                      }}
                    >
                      {loadingMain ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )}
              {executeStep >= 6 && (
                <>
                  <div className={classNames.uploadContainer}>
                    <div className={classNames.title}>
                      Step 6: Generate Closing Balance With Opening Balance
                    </div>
                    <label
                      htmlFor="closingBalance"
                      className={`${classNames.uploadBtn}`}
                    >
                      {allInputFiles?.closingBalance?.file?.name
                        ? allInputFiles?.closingBalance?.file?.name
                        : "Upload"}
                      <input
                        type="file"
                        id="closingBalance"
                        onChange={async (event) => {
                          let file = event.target?.files[0];
                          let convertedData = await parseCsvToCustomFormat(
                            file
                          );
                          let predictionData = await csvDataToJsonWithFile(
                            file
                          );
                          setAllPredictionsInput(predictionData);
                          setAllInputFiles((prev) => {
                            return {
                              ...prev,
                              closingBalance: {
                                predictions: convertedData,
                                file: file,
                                fileName: file?.name,
                                ...file,
                              },
                            };
                          });
                        }}
                      />
                    </label>
                  </div>
                  {executeStep === 6 && (
                    <div
                      className={`${classNames.submitBtn} ${
                        loadingMain && classNames.notAllowed
                      }`}
                      onClick={async () => {
                        let uploadFile = convertDataToCSVBuffer(
                          allOutputFiles?.balanceSheet?.csv_bs_piv,
                          "closing_balance"
                        );
                        const formData = new FormData();
                        formData.append("file_balance_sheet", uploadFile);
                        formData.append(
                          "file_opening_balance",
                          allInputFiles?.closingBalance?.file
                        );
                        await getAPIResponseFileUpload(
                          `${finaidAgentsURL}/api/sheet-functions/calc-closing-balance`,
                          formData,
                          "csv_closing_balance",
                          "closing_balancesheet",
                          () => setExecuteStep(7)
                        );
                      }}
                    >
                      {loadingMain ? "Loading..." : "Next Step"}
                    </div>
                  )}
                </>
              )}
              {executeStep === 7 && (
                <>
                  <div className={classNames.successMessage}>
                    Sam Super Sr has completed his job!
                  </div>
                  <div className={classNames.finalBtns}>
                    <div
                      className={classNames.returnBtn}
                      onClick={() => history.push("/marketplace")}
                    >
                      Return To Marketplace
                    </div>
                    <div
                      className={classNames.submitBtn}
                      onClick={() => window.location.reload()}
                    >
                      Clear Data & Start Again
                    </div>
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
                  {allInputFiles?.payeeFile && (
                    <TabsComponent
                      eachFile={allInputFiles?.payeeFile}
                      selectedTransaction={selectedTransactionInput}
                      setSelectedTransaction={setSelectedTransactionInput}
                      setAllPredictions={setAllPredictionsInput}
                    />
                  )}
                  {allInputFiles?.uncategorizedFile && (
                    <TabsComponent
                      eachFile={allInputFiles?.uncategorizedFile}
                      selectedTransaction={selectedTransactionInput}
                      setSelectedTransaction={setSelectedTransactionInput}
                      setAllPredictions={setAllPredictionsInput}
                    />
                  )}
                  {allInputFiles?.financialImpact && (
                    <TabsComponent
                      eachFile={allInputFiles?.financialImpact}
                      selectedTransaction={selectedTransactionInput}
                      setSelectedTransaction={setSelectedTransactionInput}
                      setAllPredictions={setAllPredictionsInput}
                    />
                  )}
                  {allInputFiles?.closingBalance && (
                    <TabsComponent
                      eachFile={allInputFiles?.closingBalance}
                      selectedTransaction={selectedTransactionInput}
                      setSelectedTransaction={setSelectedTransactionInput}
                      setAllPredictions={setAllPredictionsInput}
                    />
                  )}
                </div>
                {allPredictionsInput?.length > 0 && (
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
                  {Array.isArray(allPredictionsInput) &&
                    allPredictionsInput.length > 0 && (
                      <TransactionsTable
                        data={allPredictionsInput}
                        setData={setAllPredictionsInput}
                        searchTerm={searchTerm}
                      />
                    )}
                </div>
              </div>
              {/* output */}
              <div className={classNames.outputCard}>
                <div className={classNames.title}>Outputs</div>
                <div className={classNames.allDocs}>
                  {allOutputFiles?.fileUploadCOA && (
                    <TabsComponent
                      eachFile={allOutputFiles?.fileUploadCOA}
                      selectedTransaction={selectedTransaction}
                      setSelectedTransaction={setSelectedTransaction}
                      setAllPredictions={setAllPredictions}
                    />
                  )}
                  {allOutputFiles?.descUploadCOA && (
                    <TabsComponent
                      eachFile={allOutputFiles?.descUploadCOA}
                      selectedTransaction={selectedTransaction}
                      setSelectedTransaction={setSelectedTransaction}
                      setAllPredictions={setAllPredictions}
                    />
                  )}
                  {allOutputFiles?.categorized_transaction && (
                    <TabsComponent
                      eachFile={allOutputFiles?.categorized_transaction}
                      selectedTransaction={selectedTransaction}
                      setSelectedTransaction={setSelectedTransaction}
                      setAllPredictions={setAllPredictions}
                    />
                  )}
                  {allOutputFiles?.trial_balance && (
                    <TabsComponent
                      eachFile={allOutputFiles?.trial_balance}
                      selectedTransaction={selectedTransaction}
                      setSelectedTransaction={setSelectedTransaction}
                      setAllPredictions={setAllPredictions}
                    />
                  )}
                  {allOutputFiles?.profitAndLoss && (
                    <TabsComponent
                      eachFile={allOutputFiles?.profitAndLoss}
                      selectedTransaction={selectedTransaction}
                      setSelectedTransaction={setSelectedTransaction}
                      setAllPredictions={setAllPredictions}
                    />
                  )}
                  {allOutputFiles?.balanceSheet && (
                    <TabsComponent
                      eachFile={allOutputFiles?.balanceSheet}
                      selectedTransaction={selectedTransaction}
                      setSelectedTransaction={setSelectedTransaction}
                      setAllPredictions={setAllPredictions}
                    />
                  )}
                  {allOutputFiles?.closing_balancesheet && (
                    <TabsComponent
                      eachFile={allOutputFiles?.closing_balancesheet}
                      selectedTransaction={selectedTransaction}
                      setSelectedTransaction={setSelectedTransaction}
                      setAllPredictions={setAllPredictions}
                    />
                  )}
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
                            } else if (executeStep === 4) {
                            } else if (executeStep === 5) {
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamSuperSRBackend;

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

  console.log(data, "All predictions table");

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

const TabsComponent = ({
  eachFile,
  selectedTransaction,
  setSelectedTransaction,
  setAllPredictions,
}) => {
  return (
    <div
      className={
        selectedTransaction?.fileName === eachFile?.fileName
          ? classNames.selectedTab
          : ""
      }
      onClick={() => {
        console.log(eachFile, "Selected File");
        setSelectedTransaction(eachFile); // Set selected file
        let predictionData = csvDataToJson(eachFile.predictions);
        setAllPredictions(predictionData);
      }}
    >
      <span>{eachFile?.fileName}</span>
      {/* <span
        onClick={(e) => {
          e.stopPropagation(); // Prevent triggering the onClick of parent
          handleRemoveFile(index, setAllOutputs);
        }}
      >
        <IoIosClose />
      </span> */}
    </div>
  );
};

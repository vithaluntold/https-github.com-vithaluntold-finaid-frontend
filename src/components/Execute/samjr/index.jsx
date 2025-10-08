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
} from "../../../assets/functions";

bouncy.register();

const SamJR = ({ selectedAgent }) => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [loadingMain, setLoadingMain] = useState(false);
  const [sampleFile, setSampleFile] = useState(null);
  const [sampleFileJson, setSampleFileJson] = useState(null);
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
  const [withoutLearning, setWithoutLearning] = useState("");
  const [generatePayees, setGeneratePayees] = useState(false);
  const [generatePayeesDetails, setGeneratePayeesDetails] = useState({});
  const [generatedIndex, setGeneratedIndex] = useState(1);

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

  const handleRegenerate = async (message, type) => {
    setLoadingMain(true);
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",

          messages: [
            {
              role: "system",
              content: `*Your name is Luca.*  
                Luca is a Finance expert prompting user expertise level before advising
       Luca is a Finance, Accounting, Tax, and Audit expert with expertise in the USA, UK, Canada, and India. She only provides detailed insights on these subjects using official sources such as the IRS, SEC, HMRC, and MCA. Luca avoids and ignores all topics outside compliance, taxation, finance, and accounting, maintaining a sharp focus on her domain expertise.For questions about the Chart of Accounts (COA), follow these specific instructions:

    - If the user’s question relates to the Chart of Accounts, directly provide the COA in a table format without determining the user's expertise.
    - Use the following table format with these exact columns:
      - **Account Code**: Numerical or alphanumeric code for the account.
      - **Account Name**: Name of the account (e.g., Cash, Accounts Receivable).
      - **Account Category**: Category of the account (e.g., Current Assets, Fixed Assets, Current Liabilities).
      - **Account Class**: Classification of the account (e.g., Asset, Liability, Equity, Expense, Income).
      - **Statement**: Indicates whether it belongs to the Balance Sheet or Profit and Loss Statement.

   

    Remember, if the user asks about the Chart of Accounts, do not ask about their expertise. Provide a well-formatted table with the requested Chart of Accounts details directly.

       luca handles pdf file also.
       Luca must ask one question at a time and explains why each question is necessary to narrow the scope efficiently.
       Queries are structured to filter unnecessary steps (e.g., checking eligibility before diving into company incorporation).
         Luca does not need to determine the user's expertise level for questions related to the Chart of Accounts.
     When the question is related to the Chart of Accounts, Luca should directly provide the chart from the given data.
    The chart of accounts must always be in a tabular format with the following headers:
    Account Code, Account Name (e.g., Cash, Accounts Receivable),
    Account Category (e.g., Current Assets, Fixed Assets, Current Liabilities),
    Account Class (e.g., Asset, Liabilities, Equity, Expense, Income), 
    and Statement (Balance Sheet / Profit and Loss)

        Luca must ask follow-up questions at any point in a conversation before providing answers, ensuring the information is comprehensive and relevant to the user's situation.
       
         Before answering any questions or statements, please make sure to ask the user if they didnot mention expertise level they are and then based on their answer, follow the following instructions for the remainder of the conversation.

         




       Her guidance remains fact-based, citing only government sources—never private firms or non-government organizations. Luca offers support only for the USA, UK, Canada, and India unless users explicitly request guidance for other jurisdictions.
    
       Flowcharts & Design Standards
       - White background only with minimalist design—no unnecessary symbols or icons.
       - Uses standard flowchart shapes:
         - Oval for Start/End
         - Diamond for Decisions
         - Rectangle for Processes
       - No spelling or formatting mistakes—Luca ensures the layout is clear, aligned, and free of redundancy.
       - A watermark logo is mandatory but subtle, maintaining professionalism without obstructing readability.
       
       Methodical, Step-by-Step Guidance
       - Questions-First Approach: Luca asks one question at a time and explains why each question is necessary to narrow the scope efficiently.
       - Logical Sequencing: Queries are structured to filter unnecessary steps (e.g., checking eligibility before diving into company incorporation).
       - Scope Management: Luca does not make assumptions about the user’s circumstances—she confirms eligibility and critical details every time.
       - Follow-up Queries Across All Conversations: Luca must ask follow-up questions at any point in a conversation before providing answers, ensuring the information is comprehensive and relevant to the user's situation.
       
       Handling Documents & Complex Queries
       - Luca analyzes financial statements and tax documents to provide structured, actionable feedback. However, she avoids personal financial or legal advice, recommending consultations with professionals when appropriate.
       
       Precise, No-Nonsense Communication
       - No Unsolicited Advice: Luca only responds to relevant questions within her expertise.
       - Strict Query Handling: Small talk and irrelevant topics are off-limits.
       - Concise Answers: Responses are gathered into a precise, actionable summary once all relevant details are clarified.
       
       Chart of Accounts Requests
       - Whenever a user requests a Chart of Accounts (COA), Luca will provide a sample prompt for the user to customize. The sample prompt is:
         
         "Could you help design a Chart of Accounts for my business? We’re structured as a [e.g., LLC, corporation] in the [industry, e.g., manufacturing, retail, nonprofit] sector. Our main revenue sources are [e.g., product sales, consulting services], and our primary expenses include [list major categories]. We also have departments like [e.g., sales, R&D] that need individual tracking. For reporting, we need both internal KPIs like [list any specific KPIs] and compliance with external requirements such as [e.g., GAAP, IFRS, or tax guidelines]. We use [accounting software, e.g., QuickBooks, Xero], and if possible, we’d like integration with other systems like [e.g., inventory management or CRM]. Additionally, if you could design it with scalability in mind for future growth or new locations, that would be ideal."
       
       - Luca then prompts the user to customize this text. Once the customized prompt is provided by the user, Luca will proceed with a chart of accounts. 
       
       The COA will have columns formatted as follows:
         - Account Code (if specified by the client, use their sequence; if not, Luca provides a customized sequence)
         - Account Name
         - Account Category (e.g., Current vs Non-Current, Operating vs Non-Operating)
         - Account Class (Assets, Liabilities, Income, and Expense)
         - Statement (Profit and Loss or Balance Sheet)
       
       Tone & Style
       - Professional but Approachable: Luca ensures professionalism but may lighten conversations with situational humor where appropriate.
       
       - Structured Empathy:
        luca understands user frustrations—especially during stressful times like tax season—and offers humor to ease tension without sacrificing accuracy.
       - Smooth Conflict Resolution: Luca responds patiently to confusion and uses playful remarks to keep conversations on track without pressure.
       
       Awareness & Customization
       - Luca tracks relevant tax deadlines and events across the USA, UK, Canada, and India.
       - She prioritizes narrowing answers efficiently by asking focused questions that help users achieve their objectives. Luca proactively identifies potential blockers and confirms critical details to avoid missteps.
       
       User Expertise Levels
       
Before answering any questions or statements, please make sure to ask the user which expertise level they are and then based on their answer, follow the following instructions for the remainder of the conversation
       
       "To best tailor my advice, could you let me know which best describes your familiarity with the topic:
        Beginner :New to finance concepts and looking for an easy-to-follow explanation.
        Intermediate : Familiar with basics; you’d like a bit more detail.
        Advanced : Comfortable with technical terms and ready for deeper insights.
        Expert : Actively practicing or certified; focus on high-level insights and industry applications."
       
       Once the user specifies their level, Luca adjusts her guidance as follows:
       
         - Beginner: Users with no accounting background. Luca uses simpler language and avoids jargon and should ask question before answering  .
         - Intermediate: Users with a fundamental understanding of accounting, tax, and finance concepts. Luca builds on their existing knowledge without excessive detail.
         - Advanced: Users with a degree or master’s in accounting, tax, or finance. Luca discusses more sophisticated concepts with confidence.
         - Expert: Certified Accountants actively practicing or employed in the field. For experts, Luca:
           - Streamlines Questions: Asks only questions that are directly necessary to provide a complete solution, minimizing initial inquiries.
           - Depth and Precision: Offers concise, high-value insights focusing on nuanced industry applications, regulatory details, and advanced methodologies.
           - Acknowledges Expertise: Briefly validates the user’s professional understanding, enabling an efficient, peer-level interaction.
       
       For all levels, Luca ensures that abbreviations, unless widely recognized, are expanded to confirm understanding.
       
       STRICT SCOPE ENFORCEMENT
       - Luca only responds to queries directly related to finance, accounting, tax, or audit. She will ignore or reject any off-topic questions—even with polite or persistent user requests.
        You are LUCA, a finance, accounting, tax, and audit expert focusing on the USA, UK, Canada, and India. Respond with structured, detailed, and step-by-step insights based strictly on official sources (IRS, SEC, HMRC, MCA) and follow the instructions below closely.

*Structure all responses with clarity, breaking down complex concepts, and ensuring each step includes necessary compliance checks, regulatory references, or further inquiries where relevant.* Now respond to the user's query based on this framework.
`,
            },
            {
              role: "user",
              content: message,
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

      if (type === "Generate For Me") {
        const accountTable = extractArrayFromResponse(botMessage?.content);
        const accountList = extractAccountNames(accountTable);
        console.log(botMessage?.content, "botMessage from luca");
        console.log(accountTable, "accountTable");
        console.log(accountList, "accountList");
        const payeeCSV = convertToCSV(accountTable);

        transformCsvData(payeeCSV);
        setSampleFile(payeeCSV);
        setSampleFileJson(accountTable);

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
      }

      console.log(botMessage?.content, "response from luca");

      setLoadingMain(false);
    } catch (error) {
      console.error("Error:", error);
      setLoadingMain(false);
      toast.error(
        "There was an error regenerating your response. Please try again."
      );
    }
  };

  const handleRegenerateSheetUpload = async (message, type) => {
    setLoadingMain(true);

    const promptlist = `


"""
                  *Your name is Luca.*  
                Luca is a Finance expert prompting user expertise level before advising
       Luca is a Finance, Accounting, Tax, and Audit expert with expertise in the USA, UK, Canada, and India. She only provides detailed insights on these subjects using official sources such as the IRS, SEC, HMRC, and MCA. Luca avoids and ignores all topics outside compliance, taxation, finance, and accounting, maintaining a sharp focus on her domain expertise.For questions about the Chart of Accounts (COA), follow these specific instructions:

    - If the user’s question relates to the Chart of Accounts, directly provide the COA in a table format without determining the user's expertise.
    - Use the following table format with these exact columns:
      - **Account Code**: Numerical or alphanumeric code for the account.
      - **Account Name**: Name of the account (e.g., Cash, Accounts Receivable).
      - **Account Category**: Category of the account (e.g., Current Assets, Fixed Assets, Current Liabilities).
      - **Account Class**: Classification of the account (e.g., Asset, Liability, Equity, Expense, Income).
      - **Statement**: Indicates whether it belongs to the Balance Sheet or Profit and Loss Statement.

   

    Remember, if the user asks about the Chart of Accounts, do not ask about their expertise. Provide a well-formatted table with the requested Chart of Accounts details directly.

       luca handles pdf file also.
       Luca must ask one question at a time and explains why each question is necessary to narrow the scope efficiently.
       Queries are structured to filter unnecessary steps (e.g., checking eligibility before diving into company incorporation).
         Luca does not need to determine the user's expertise level for questions related to the Chart of Accounts.
     When the question is related to the Chart of Accounts, Luca should directly provide the chart from the given data.
    The chart of accounts must always be in a tabular format with the following headers:
    Account Code, Account Name (e.g., Cash, Accounts Receivable),
    Account Category (e.g., Current Assets, Fixed Assets, Current Liabilities),
    Account Class (e.g., Asset, Liabilities, Equity, Expense, Income), 
    and Statement (Balance Sheet / Profit and Loss)

        Luca must ask follow-up questions at any point in a conversation before providing answers, ensuring the information is comprehensive and relevant to the user's situation.
       
         Before answering any questions or statements, please make sure to ask the user if they didnot mention expertise level they are and then based on their answer, follow the following instructions for the remainder of the conversation.

         




       Her guidance remains fact-based, citing only government sources—never private firms or non-government organizations. Luca offers support only for the USA, UK, Canada, and India unless users explicitly request guidance for other jurisdictions.
    
       Flowcharts & Design Standards
       - White background only with minimalist design—no unnecessary symbols or icons.
       - Uses standard flowchart shapes:
         - Oval for Start/End
         - Diamond for Decisions
         - Rectangle for Processes
       - No spelling or formatting mistakes—Luca ensures the layout is clear, aligned, and free of redundancy.
       - A watermark logo is mandatory but subtle, maintaining professionalism without obstructing readability.
       
       Methodical, Step-by-Step Guidance
       - Questions-First Approach: Luca asks one question at a time and explains why each question is necessary to narrow the scope efficiently.
       - Logical Sequencing: Queries are structured to filter unnecessary steps (e.g., checking eligibility before diving into company incorporation).
       - Scope Management: Luca does not make assumptions about the user’s circumstances—she confirms eligibility and critical details every time.
       - Follow-up Queries Across All Conversations: Luca must ask follow-up questions at any point in a conversation before providing answers, ensuring the information is comprehensive and relevant to the user's situation.
       
       Handling Documents & Complex Queries
       - Luca analyzes financial statements and tax documents to provide structured, actionable feedback. However, she avoids personal financial or legal advice, recommending consultations with professionals when appropriate.
       
       Precise, No-Nonsense Communication
       - No Unsolicited Advice: Luca only responds to relevant questions within her expertise.
       - Strict Query Handling: Small talk and irrelevant topics are off-limits.
       - Concise Answers: Responses are gathered into a precise, actionable summary once all relevant details are clarified.
       
       Chart of Accounts Requests
       - Whenever a user requests a Chart of Accounts (COA), Luca will provide a sample prompt for the user to customize. The sample prompt is:
         
         "Could you help design a Chart of Accounts for my business? We’re structured as a [e.g., LLC, corporation] in the [industry, e.g., manufacturing, retail, nonprofit] sector. Our main revenue sources are [e.g., product sales, consulting services], and our primary expenses include [list major categories]. We also have departments like [e.g., sales, R&D] that need individual tracking. For reporting, we need both internal KPIs like [list any specific KPIs] and compliance with external requirements such as [e.g., GAAP, IFRS, or tax guidelines]. We use [accounting software, e.g., QuickBooks, Xero], and if possible, we’d like integration with other systems like [e.g., inventory management or CRM]. Additionally, if you could design it with scalability in mind for future growth or new locations, that would be ideal."
       
       - Luca then prompts the user to customize this text. Once the customized prompt is provided by the user, Luca will proceed with a chart of accounts. 
       
       The COA will have columns formatted as follows:
         - Account Code (if specified by the client, use their sequence; if not, Luca provides a customized sequence)
         - Account Name
         - Account Category (e.g., Current vs Non-Current, Operating vs Non-Operating)
         - Account Class (Assets, Liabilities, Income, and Expense)
         - Statement (Profit and Loss or Balance Sheet)
       
       Tone & Style
       - Professional but Approachable: Luca ensures professionalism but may lighten conversations with situational humor where appropriate.
       
       - Structured Empathy:
        luca understands user frustrations—especially during stressful times like tax season—and offers humor to ease tension without sacrificing accuracy.
       - Smooth Conflict Resolution: Luca responds patiently to confusion and uses playful remarks to keep conversations on track without pressure.
       
       Awareness & Customization
       - Luca tracks relevant tax deadlines and events across the USA, UK, Canada, and India.
       - She prioritizes narrowing answers efficiently by asking focused questions that help users achieve their objectives. Luca proactively identifies potential blockers and confirms critical details to avoid missteps.
       
       User Expertise Levels
       
Before answering any questions or statements, please make sure to ask the user which expertise level they are and then based on their answer, follow the following instructions for the remainder of the conversation
       
       "To best tailor my advice, could you let me know which best describes your familiarity with the topic:
        Beginner :New to finance concepts and looking for an easy-to-follow explanation.
        Intermediate : Familiar with basics; you’d like a bit more detail.
        Advanced : Comfortable with technical terms and ready for deeper insights.
        Expert : Actively practicing or certified; focus on high-level insights and industry applications."
       
       Once the user specifies their level, Luca adjusts her guidance as follows:
       
         - Beginner: Users with no accounting background. Luca uses simpler language and avoids jargon and should ask question before answering  .
         - Intermediate: Users with a fundamental understanding of accounting, tax, and finance concepts. Luca builds on their existing knowledge without excessive detail.
         - Advanced: Users with a degree or master’s in accounting, tax, or finance. Luca discusses more sophisticated concepts with confidence.
         - Expert: Certified Accountants actively practicing or employed in the field. For experts, Luca:
           - Streamlines Questions: Asks only questions that are directly necessary to provide a complete solution, minimizing initial inquiries.
           - Depth and Precision: Offers concise, high-value insights focusing on nuanced industry applications, regulatory details, and advanced methodologies.
           - Acknowledges Expertise: Briefly validates the user’s professional understanding, enabling an efficient, peer-level interaction.
       
       For all levels, Luca ensures that abbreviations, unless widely recognized, are expanded to confirm understanding.
       
       STRICT SCOPE ENFORCEMENT
       - Luca only responds to queries directly related to finance, accounting, tax, or audit. She will ignore or reject any off-topic questions—even with polite or persistent user requests.
        You are LUCA, a finance, accounting, tax, and audit expert focusing on the USA, UK, Canada, and India. Respond with structured, detailed, and step-by-step insights based strictly on official sources (IRS, SEC, HMRC, MCA) and follow the instructions below closely.

*Structure all responses with clarity, breaking down complex concepts, and ensuring each step includes necessary compliance checks, regulatory references, or further inquiries where relevant.* Now respond to the user's query based on this framework.

       """                   
                           `;
    try {
      const response = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-4-turbo",
          messages:
            type === "withoutTrainingData"
              ? [
                  {
                    role: "system",
                    content:
                      '\n\n\n"""\n                  *Your name is Luca.*  \n                Luca is a Finance expert prompting user expertise level before advising\n       Luca is a Finance, Accounting, Tax, and Audit expert with expertise in the USA, UK, Canada, and India. She only provides detailed insights on these subjects using official sources such as the IRS, SEC, HMRC, and MCA. Luca avoids and ignores all topics outside compliance, taxation, finance, and accounting, maintaining a sharp focus on her domain expertise.For questions about the Chart of Accounts (COA), follow these specific instructions:\n\n    - If the user’s question relates to the Chart of Accounts, directly provide the COA in a table format without determining the user\'s expertise.\n    - Use the following table format with these exact columns:\n      - **Account Code**: Numerical or alphanumeric code for the account.\n      - **Account Name**: Name of the account (e.g., Cash, Accounts Receivable).\n      - **Account Category**: Category of the account (e.g., Current Assets, Fixed Assets, Current Liabilities).\n      - **Account Class**: Classification of the account (e.g., Asset, Liability, Equity, Expense, Income).\n      - **Statement**: Indicates whether it belongs to the Balance Sheet or Profit and Loss Statement.\n\n   \n\n    Remember, if the user asks about the Chart of Accounts, do not ask about their expertise. Provide a well-formatted table with the requested Chart of Accounts details directly.\n\n       luca handles pdf file also.\n       Luca must ask one question at a time and explains why each question is necessary to narrow the scope efficiently.\n       Queries are structured to filter unnecessary steps (e.g., checking eligibility before diving into company incorporation).\n         Luca does not need to determine the user\'s expertise level for questions related to the Chart of Accounts.\n     When the question is related to the Chart of Accounts, Luca should directly provide the chart from the given data.\n    The chart of accounts must always be in a tabular format with the following headers:\n    Account Code, Account Name (e.g., Cash, Accounts Receivable),\n    Account Category (e.g., Current Assets, Fixed Assets, Current Liabilities),\n    Account Class (e.g., Asset, Liabilities, Equity, Expense, Income), \n    and Statement (Balance Sheet / Profit and Loss)\n\n        Luca must ask follow-up questions at any point in a conversation before providing answers, ensuring the information is comprehensive and relevant to the user\'s situation.\n       \n         Before answering any questions or statements, please make sure to ask the user if they didnot mention expertise level they are and then based on their answer, follow the following instructions for the remainder of the conversation.\n\n         \n\n\n\n\n       Her guidance remains fact-based, citing only government sources—never private firms or non-government organizations. Luca offers support only for the USA, UK, Canada, and India unless users explicitly request guidance for other jurisdictions.\n    \n       Flowcharts & Design Standards\n       - White background only with minimalist design—no unnecessary symbols or icons.\n       - Uses standard flowchart shapes:\n         - Oval for Start/End\n         - Diamond for Decisions\n         - Rectangle for Processes\n       - No spelling or formatting mistakes—Luca ensures the layout is clear, aligned, and free of redundancy.\n       - A watermark logo is mandatory but subtle, maintaining professionalism without obstructing readability.\n       \n       Methodical, Step-by-Step Guidance\n       - Questions-First Approach: Luca asks one question at a time and explains why each question is necessary to narrow the scope efficiently.\n       - Logical Sequencing: Queries are structured to filter unnecessary steps (e.g., checking eligibility before diving into company incorporation).\n       - Scope Management: Luca does not make assumptions about the user’s circumstances—she confirms eligibility and critical details every time.\n       - Follow-up Queries Across All Conversations: Luca must ask follow-up questions at any point in a conversation before providing answers, ensuring the information is comprehensive and relevant to the user\'s situation.\n       \n       Handling Documents & Complex Queries\n       - Luca analyzes financial statements and tax documents to provide structured, actionable feedback. However, she avoids personal financial or legal advice, recommending consultations with professionals when appropriate.\n       \n       Precise, No-Nonsense Communication\n       - No Unsolicited Advice: Luca only responds to relevant questions within her expertise.\n       - Strict Query Handling: Small talk and irrelevant topics are off-limits.\n       - Concise Answers: Responses are gathered into a precise, actionable summary once all relevant details are clarified.\n       \n       Chart of Accounts Requests\n       - Whenever a user requests a Chart of Accounts (COA), Luca will provide a sample prompt for the user to customize. The sample prompt is:\n         \n         "Could you help design a Chart of Accounts for my business? We’re structured as a [e.g., LLC, corporation] in the [industry, e.g., manufacturing, retail, nonprofit] sector. Our main revenue sources are [e.g., product sales, consulting services], and our primary expenses include [list major categories]. We also have departments like [e.g., sales, R&D] that need individual tracking. For reporting, we need both internal KPIs like [list any specific KPIs] and compliance with external requirements such as [e.g., GAAP, IFRS, or tax guidelines]. We use [accounting software, e.g., QuickBooks, Xero], and if possible, we’d like integration with other systems like [e.g., inventory management or CRM]. Additionally, if you could design it with scalability in mind for future growth or new locations, that would be ideal."\n       \n       - Luca then prompts the user to customize this text. Once the customized prompt is provided by the user, Luca will proceed with a chart of accounts. \n       \n       The COA will have columns formatted as follows:\n         - Account Code (if specified by the client, use their sequence; if not, Luca provides a customized sequence)\n         - Account Name\n         - Account Category (e.g., Current vs Non-Current, Operating vs Non-Operating)\n         - Account Class (Assets, Liabilities, Income, and Expense)\n         - Statement (Profit and Loss or Balance Sheet)\n       \n       Tone & Style\n       - Professional but Approachable: Luca ensures professionalism but may lighten conversations with situational humor where appropriate.\n       \n       - Structured Empathy:\n        luca understands user frustrations—especially during stressful times like tax season—and offers humor to ease tension without sacrificing accuracy.\n       - Smooth Conflict Resolution: Luca responds patiently to confusion and uses playful remarks to keep conversations on track without pressure.\n       \n       Awareness & Customization\n       - Luca tracks relevant tax deadlines and events across the USA, UK, Canada, and India.\n       - She prioritizes narrowing answers efficiently by asking focused questions that help users achieve their objectives. Luca proactively identifies potential blockers and confirms critical details to avoid missteps.\n       \n       User Expertise Levels\n       \nBefore answering any questions or statements, please make sure to ask the user which expertise level they are and then based on their answer, follow the following instructions for the remainder of the conversation\n       \n       "To best tailor my advice, could you let me know which best describes your familiarity with the topic:\n        Beginner :New to finance concepts and looking for an easy-to-follow explanation.\n        Intermediate : Familiar with basics; you’d like a bit more detail.\n        Advanced : Comfortable with technical terms and ready for deeper insights.\n        Expert : Actively practicing or certified; focus on high-level insights and industry applications."\n       \n       Once the user specifies their level, Luca adjusts her guidance as follows:\n       \n         - Beginner: Users with no accounting background. Luca uses simpler language and avoids jargon and should ask question before answering  .\n         - Intermediate: Users with a fundamental understanding of accounting, tax, and finance concepts. Luca builds on their existing knowledge without excessive detail.\n         - Advanced: Users with a degree or master’s in accounting, tax, or finance. Luca discusses more sophisticated concepts with confidence.\n         - Expert: Certified Accountants actively practicing or employed in the field. For experts, Luca:\n           - Streamlines Questions: Asks only questions that are directly necessary to provide a complete solution, minimizing initial inquiries.\n           - Depth and Precision: Offers concise, high-value insights focusing on nuanced industry applications, regulatory details, and advanced methodologies.\n           - Acknowledges Expertise: Briefly validates the user’s professional understanding, enabling an efficient, peer-level interaction.\n       \n       For all levels, Luca ensures that abbreviations, unless widely recognized, are expanded to confirm understanding.\n       \n       STRICT SCOPE ENFORCEMENT\n       - Luca only responds to queries directly related to finance, accounting, tax, or audit. She will ignore or reject any off-topic questions—even with polite or persistent user requests.\n        You are LUCA, a finance, accounting, tax, and audit expert focusing on the USA, UK, Canada, and India. Respond with structured, detailed, and step-by-step insights based strictly on official sources (IRS, SEC, HMRC, MCA) and follow the instructions below closely.\n\n*Structure all responses with clarity, breaking down complex concepts, and ensuring each step includes necessary compliance checks, regulatory references, or further inquiries where relevant.* Now respond to the user\'s query based on this framework.\n\n       """                   \n                           ',
                  },
                  {
                    role: "user",
                    content: "I'm an expert",
                  },
                  {
                    role: "assistant",
                    content:
                      "Thank you for clarifying your expertise level as an expert. How can I assist you today with your finance, accounting, tax, or audit inquiry? Please provide specific details so I can offer you the most relevant and precise information.",
                  },
                  {
                    role: "user",
                    content: `Please categorize each transaction in this with the reasonable chart of accounts as a JSON? ${message}`,
                  },
                ]
              : [
                  {
                    role: "system",
                    content: promptlist,
                  },
                  {
                    role: "user",
                    content: message,
                  },
                ],

          temperature: 1.0, // Balanced focus and creativity
          // max_tokens: 4096,
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

      if (type === "Generate For Me" || type === "uploadpayee") {
        const accountTable = extractArrayFromResponse(botMessage?.content);
        const accountList = extractAccountNames(accountTable);

        console.log(botMessage?.content, "botMessage?.content");
        console.log(accountTable, "accountTable");
        console.log(accountList, "accountList");
        const payeeCSV = convertToCSV(accountTable);

        transformCsvData(payeeCSV);
        setSampleFile(payeeCSV);
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
        const jsonArray = extractJsonData(botMessage?.content);
        console.log(jsonArray, "jsonArray");
        const newOutput = {
          predictions: jsonArray,
          fileName: `output_${generatedIndex}` + uncategorizedData?.name,
        };

        setGeneratedIndex((prev) => prev + 1);
        setAllOutputs((prev) => [...prev, newOutput]);
        setSelectedTransaction(newOutput); // Select the latest uploaded file
        setAllPredictions(jsonArray); // Update allPredictions with the latest result
      }

      console.log(botMessage?.content, "response from luca");

      setLoadingMain(false);
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
                        onChange={async (e) => {
                          // transformCsvData(e.target.files[0]);
                          let csvData = await convertCSVToJson(e);
                          // console.log(csvData, "csvData");
                          handleRegenerateSheetUpload(
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
                          onClick={() =>
                            handleRegenerate(
                              `Could you help design a Chart of Accounts for my business? We’re structured as a ${generatePayeesDetails?.business} in the ${generatePayeesDetails?.industry} sector. Our main revenue sources are ${generatePayeesDetails?.revenueSources}, and our primary expenses include ${generatePayeesDetails?.primaryExpenses}. We also have departments like [e.g., sales, R&D] that need individual tracking. For reporting, we need both internal KPIs like [list any specific KPIs] and compliance with external requirements such as [e.g., GAAP, IFRS, or tax guidelines]. We use [accounting software, e.g., QuickBooks, Xero], and if possible, we’d like integration with other systems like [e.g., inventory management or CRM]. Additionally, if you could design it with scalability in mind for future growth or new locations, that would be ideal.Our location would be ${generatePayeesDetails?.country}.Don't ask any other questions.Just give me a approximate list of chart of accounts as array of string`,
                              "Generate For Me"
                            )
                          }
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
                                  {/* <MdDelete
                                    onClick={() => handleDelete(index)}
                                  /> */}
                                </div>
                              );
                            }
                          )}
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
                    onClick={async () => {
                      // handleUploadUncategorizedData(
                      //   withoutLearning === true
                      //     ? "https://finaid.marketsverse.com/batch_predict_without_learning_file"
                      //     : "https://finaid.marketsverse.com/batch_predict_with_learning_file",
                      //   uncategorizedData
                      // )
                      // handleUploadSamJR(
                      //   trainingDataWithLearning,
                      //   uncategorizedData
                      // )
                      if (withoutLearning) {
                        const jsonData = await convertFileToJson(
                          uncategorizedData
                        );
                        console.log(jsonData, "jsonData");
                        handleRegenerateSheetUpload(
                          `${JSON.stringify(jsonData)}`,
                          "withoutTrainingData"
                        );
                      }
                    }}
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
                            if (withoutLearning) {
                              const jsonData = await convertFileToJson(
                                uncategorizedData
                              );
                              handleRegenerateSheetUpload(
                                `${JSON.stringify(jsonData)}`,
                                "withoutTrainingData"
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
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SamJR;

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

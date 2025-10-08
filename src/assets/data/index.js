import kaira from "../images/home/kaira.webp";
import aidam from "../images/home/gentleman.webp";
import saina from "../images/home/saina.webp";
import samir from "../images/home/samir.svg";
import zaick from "../images/home/zaick.svg";
import samirsr from "../images/home/samsr.svg";
import samirspsr from "../images/home/samspsr.png";
import zaicksr from "../images/home/zaicksr.svg";

export const allMarketPlace = [
  {
    title: "Inteview to test the capability",
    desc: "Assign tasks to the Fin(Ai)ds to check the accuracy before you hire!",
  },
  {
    title: "Effortless Task Management",
    desc: "Hire multiple Fin(Ai)ds to create your own team of accountants.",
  },
  {
    title: "Train the accountants on your books",
    desc: "Let the Fin(Ai)ds train on the accounting data. Answer their queries.",
  },
  {
    title: "Create your own Fin(Ai)d",
    desc: "You can also create your own Fin(Ai)d customized for your requirements.",
  },
];

export const allAgents = [
  // {
  //   profilePic: kaira,
  //   name: "K(Ai)ra",
  //   desc: "Hey there, I’m K(Ai)ra, your expert in Xero and Zoho Books! With a focus on Cash Application, With over 23,000 hires and a star ration of 4.6, I ensure your payments are accurately applied, streamlining your financial processes. Let’s make managing your cash flow smoother and smarter!",
  // },
  // {
  //   profilePic: aidam,
  //   name: "(Ai)dam",
  //   desc: "Hi, I'm (Ai)dam, your go-to AI accountant! I specialize in QuickBooks, Xero, and Zoho, and I’ve handled invoicing and expense categorization for over 31,000 clients. With a 4.3-star rating, I’m here to simplify your books and make your accounting hassle-free. Let’s get to work!",
  // },
  // {
  //   profilePic: saina,
  //   name: "S(Ai)na",
  //   desc: "Hi, I'm S(ai)na! With over 12,000 hires and a solid 4.2-star rating, I specialize in Xero, NetSuite, and Microsoft Dynamics 365, focusing on payroll activities. I'm here to ensure your payroll is seamless and accurate, helping you manage your team efficiently!",
  // },
  {
    profilePic: samir,
    name: "S(ai)m Jr",
    searchName: "SaimJr",
    desc: `Hey there! This is S(ai)m. I'm an expert in categorizing transactions using my predictive capabilities, and 'excel-in & excel-out' is my forte.`,
    desc2: "P.S. I don't enjoy working in an accrual accounting environment!",
  },
  {
    profilePic: samirsr,
    name: "S(ai)m Sr",
    searchName: "SaimSr",
    desc: `Hey there! I'm  S(ai)m Sr. I can do everything S(ai)m Jr can and also prepare financial statements from the categorized transactions in an 'excel-in & excel-out' scenario.`,
    desc2:
      "P.S. Somethings never change! I still don't take up accrual accounting assignments.",
  },
  {
    profilePic: samirspsr,
    name: "S(ai)m Super Sr",
    searchName: "SaimSuperSr",
    desc: `Hey there! I'm  S(ai)m Super Sr. I can do everything S(ai)m Jr can and S(ai)m Sr can do and also prepare balance sheet with taking opening balance.`,
    desc2:
      "P.S. Somethings never change! I still don't take up accrual accounting assignments.",
  },
  {
    profilePic: zaick,
    name: "Z(ai)ck Jr",
    searchName: "ZaickJr",
    desc: `Hello folks! I'm Z(ai)k Jr and hire me to automate your bank categorization in Zoho Books. I can handle all the scenarios in bank categorization except a case where payment advice is involved. `,
    desc2:
      "P.S. I'm more effective in cash basis of accounting or under accrual basis of accounting where invoices and bills are matched one-on-one.",
  },
  {
    profilePic: zaicksr,
    name: "Z(ai)ck Sr",
    searchName: "ZaickSr",
    desc: `Hello folks! I'm Z(ai)k Jr and hire me to automate your bank categorization in Zoho Books. I can handle all the scenarios in bank categorization.`,
    desc2:
      "P.S. Keep all your payment advices handy. I'm gonna need them in 'cash application against multiple bills or multiple invoices' scenario.",
  },
];

export const allFeedback = [
  // {
  //   feedback: `"Sadie helps me stay informed with the latest news and updates that are relevant to my interests.”`,
  //   author: "Emily A. (Software Engineer)",
  // },
  {
    feedback: `“It has become so convenient to manage my day-to-day bookkeeping process with zero latency"`,
    author: "Sarah K. (Entrepreneur)",
  },
  // {
  //   feedback: `”Sadie has been a game-changer for my busy schedule".`,
  //   author: "John S.  (Marketing Manager)",
  // },
];

export const allStepsSamjr = [
  {
    step: "Step 1",
    desc: "Enter your business type and Finaid will suggest you the ideal chart of accounts",
  },
  {
    step: "Step 2",
    desc: "Review and make any changes to the chart of accounts which Sam suggests",
  },
  {
    step: "Step 3",
    desc: "Upload your spreadsheet with uncategorized transactions ",
  },
  {
    step: "Step 4",
    desc: "Identify which of the columns in your sheet match the required data points",
  },
  {
    step: "Step 5",
    desc: "If you wish to train Sam Jr, please upload an additional spreadsheet with categorized transctions that he will learn from",
    notification: "Optional",
  },
  {
    step: "Step 6",
    desc: "Watch as Sam Jr does the task and the output will be a new spreadsheet with two additional columns for the predicted payee and chart of account",
  },
];

// API URL - uses environment variable for deployment flexibility
export const finaidAgentsURL = process.env.REACT_APP_API_URL || "http://localhost:3000";

export const promptlist = `Your name is Luca.*  
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

*Structure all responses with clarity, breaking down complex concepts, and ensuring each step includes necessary compliance checks, regulatory references, or further inquiries where relevant.* Now respond to the user's query based on this framework.If not given expertise in response take it as advanced.`;

export const coaGenerateForMe = (generatePayeesDetails) => {
  return `Design a comprehensive Chart of Accounts for a business structured as a ${generatePayeesDetails?.business} in the ${generatePayeesDetails?.industry} sector, with revenue sources like ${generatePayeesDetails?.revenueSources} and primary expenses such as ${generatePayeesDetails?.primaryExpenses}. Include individual tracking for departments like [e.g., sales, R&D] and support internal KPIs and external compliance requirements (e.g., GAAP, IFRS, or tax guidelines). The COA should be compatible with [accounting software, e.g., QuickBooks, Xero], support integration with systems like [e.g., inventory management, CRM], and be scalable for future growth or new locations in ${generatePayeesDetails?.country}. Provide an approximate list of accounts as an array of strings without additional questions.

Additional Guidelines for COA Structure:

Entity-Specific Accounts: Include entity-based accounts such as Share Capital, Retained Earnings, Member Contributions, etc.
Tax Accounts: Add mandatory tax accounts based on jurisdiction (e.g., USA, India, UAE).
Expense Categories: Include key expenses like COGS, Salaries, Rent, Utilities, Marketing, etc.

IMPORTANT: Return the CSV only and do not return any additional text. Use "," as the separator for the CSV.
`;
};

export const uncategorizedTransactionsPrompt = `Based on the uncategorized transactions data, create a single CSV output with these specifications:

Required columns:
[Include your original data columns],
Chart of Transaction Particulars,
Account,
Account Category [Asset/Liability/Income/Expense],
Account Type [Current/Non-Current],
Statement [Balance Sheet/P&L],
Financial Impact [Use these rules:
- Asset (Debit): Positive
- Liability (Credit): Positive
- Expense (Debit): Negative
- Revenue (Credit): Positive],
Transaction Partner

Format:
- CSV format only
- Include all transactions without summarization
- No computed amounts column
- No explanations or additional text

Inputs that you will be provided with:
            - CSV of uncategorized transactions
            - CSV of Chart of Accounts
`;

export const transactionSummaryPrompt = `Categorize the following transactions and format as CSV with these requirements:
      Input rules:
      1. Use all original columns from the input data
      2. Add these new columns:
        - Chart of Transaction Particulars
        - Account
        - Account Category
        - Account Type
        - Statement
        - Financial Impact
        - Transaction Partner

      Financial Impact calculation rules:
      - Asset (Debit balance) = Positive amount
      - Liability (Credit balance) = Positive amount
      - Expense (Debit balance) = Negative amount
      - Revenue (Credit balance) = Positive amount

      Output requirements:
      1. Format as pure CSV with no explanatory text or summaries
      2. Include all transactions without truncation
      3. Keep all original data intact
      4. Do not include a computed amount column
      5. Present full CSV immediately after the header row`;

export const trialBalancePrompt = `Convert the below transaction data into a trial balance CSV format. The output should only have 3 columns: Account, Debit, Credit. Follow these rules:

Positive amounts go to the Debit column
Negative amounts go to the Credit column (make them positive)
Skip all subtotal rows and empty rows
Include a TOTAL row at the bottom
Don't add any explanations or markdown, just output the CSV

Expected output format example:
Account,Debit,Credit
Sales Revenue,860654,
Salaries and Employee Wages,,70668
Other Expenses/Bank Charges,,613453.35
TOTAL,860654.00,684121.35`;

export const profitAndLossPrompt = `Generate a detailed Profit and Loss statement from the following trial balance data.

Requirements:
1. Format as hierarchical CSV with columns:
   - Category (Income/Expense)
   - Sub Category (Operating Revenue, Operating Expense, Departmental Expense)
   - Account Name
   - Financial Impact

Categorization rules:
Income Category:
- Operating Revenue:
  * Sales Revenue
  * Sales Returns and Allowances (negative)
  * Other operating income items

Expense Category:
- Operating Expense:
  * Cost of Sales
  * Selling Expenses
- Departmental Expense:
  * Administrative Expenses
  * Finance Expenses
  * HR Expenses

Calculation rules:
1. Income items show as positive
2. Expense items show as negative
3. Include subtotals for each category and subcategory
4. Show final Net Profit/Loss

Output requirements:
      1. Format as pure CSV with no explanatory text or summaries
`;

export const balanceSheetPrompt = (openingBalance, categorizedTransaction) => {
  return `Using the below uncategorized transaction data summary and other data from our previous conversation & with opening balance of ${openingBalance}, please generate a balance sheet with the following structure:

Uncategorized transaction data:
 - ${categorizedTransaction}

Required Format:
Statement: Balance Sheet

Please organize the data in this exact hierarchy:
1. Assets [Total]
   - Current Asset
   - Non-Current Asset

2. Liabilities [Total]
   - Current Liability
   - Non-Current Liability

3. Equity [Total]
   - Equity components

Requirements:
- Present the data in two columns: "Row Labels" and "Sum of Financial Impact"
- Include subtotals for main categories (Assets, Liabilities, Equity)
- Format all numbers as whole numbers without decimals
- Maintain proper accounting equation: Assets = Liabilities + Equity
- Use indentation or clear hierarchy to show parent-child relationships
- Include expandable/collapsible sections (▼) for main categories

Expected output:
1. Format as array of objects JSON with no explanatory text or summaries

Please verify that:
1. All totals are calculated correctly
2. The balance sheet balances (Assets = Liabilities + Equity)
3. All amounts from the trial balance and P&L are properly classified

IMPORTANT: Return the CSV only and do not return any additional text. Use "," as the separator for the CSV.`;
};

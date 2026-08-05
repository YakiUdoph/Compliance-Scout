export const STATE_WORKFLOWS = {
    DE: {
        stateCode: 'DE',
        stateName: 'Delaware',
        portalUrl: 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
        steps: [
            { stepNumber: 1, action: 'GOTO', value: 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx', description: 'Navigate to Delaware ICIS Corp portal' },
            { stepNumber: 2, action: 'ASSERT_DOM', selector: '#ctl00_ContentPlaceHolder1_txtEntityName', description: 'Assert DE search field rendered' },
            { stepNumber: 3, action: 'FILL', selector: '#ctl00_ContentPlaceHolder1_txtEntityName', value: '{BUSINESS_NAME}', description: 'Fill search query into DE entity search box' },
            { stepNumber: 4, action: 'CLICK', selector: '#ctl00_ContentPlaceHolder1_btnSubmit', description: 'Click DE entity search submit button' },
            { stepNumber: 5, action: 'ASSERT_DOM', selector: '#ctl00_ContentPlaceHolder1_gvResults table', description: 'Assert DE search result grid populated' },
            { stepNumber: 6, action: 'CLICK', selector: '#ctl00_ContentPlaceHolder1_gvResults table tr.data-row a', description: 'Click target entity in search results' },
            { stepNumber: 7, action: 'ASSERT_DOM', selector: '.entity-details-container', description: 'Assert DE entity details page DOM state' },
            { stepNumber: 8, action: 'SCREENSHOT', description: 'Capture screenshot of DE entity detail portal view' },
            { stepNumber: 9, action: 'READ_STATUS', selector: '#ctl00_ContentPlaceHolder1_lblStatus', description: 'Read raw DE entity legal status tag' },
            { stepNumber: 10, action: 'NAVIGATE_FILING', selector: '#ctl00_ContentPlaceHolder1_btnPayFranchiseTax', description: 'Branch: Navigate to Delaware Tax Filing Portal if taxes due' },
            { stepNumber: 11, action: 'READ_AMOUNT_OWED', selector: '#ctl00_ContentPlaceHolder1_lblTaxesOwed', value: '$300.00', description: 'Branch: Extract outstanding annual franchise tax amount' },
            { stepNumber: 12, action: 'REQUEST_CERTIFICATE', selector: '#ctl00_ContentPlaceHolder1_btnGenerateCert', description: 'Branch: Request Delaware Certificate of Good Standing PDF' },
            { stepNumber: 13, action: 'LOG_RESULT', description: 'Log DE execution summary & step telemetry' }
        ]
    },
    CA: {
        stateCode: 'CA',
        stateName: 'California',
        portalUrl: 'https://bizfileonline.sos.ca.gov/search/business',
        steps: [
            { stepNumber: 1, action: 'GOTO', value: 'https://bizfileonline.sos.ca.gov/search/business', description: 'Navigate to California bizfileOnline portal' },
            { stepNumber: 2, action: 'ASSERT_DOM', selector: "input[data-testid='business-search-input']", description: 'Assert CA search input element exists' },
            { stepNumber: 3, action: 'FILL', selector: "input[data-testid='business-search-input']", value: '{BUSINESS_NAME}', description: 'Fill search query into CA bizfile input' },
            { stepNumber: 4, action: 'CLICK', selector: "button[data-testid='search-button']", description: 'Click CA bizfile search button' },
            { stepNumber: 5, action: 'ASSERT_DOM', selector: '.search-results-table', description: 'Assert CA search result table rendered' },
            { stepNumber: 6, action: 'CLICK', selector: '.search-results-table tbody tr:first-child td a', description: 'Click target CA entity detail link' },
            { stepNumber: 7, action: 'ASSERT_DOM', selector: "[data-testid='entity-status-tag']", description: 'Assert CA entity detail summary loaded' },
            { stepNumber: 8, action: 'SCREENSHOT', description: 'Capture screenshot of CA entity record page' },
            { stepNumber: 9, action: 'READ_STATUS', selector: "[data-testid='entity-status-tag']", description: 'Extract CA entity standing status text' },
            { stepNumber: 10, action: 'NAVIGATE_FILING', selector: '#statement-of-information-link', description: 'Branch: Navigate to CA Statement of Information Filing page' },
            { stepNumber: 11, action: 'READ_AMOUNT_OWED', selector: '.amount-due-highlight', value: '$800.00', description: 'Branch: Read CA penalty & annual filing fees' },
            { stepNumber: 12, action: 'REQUEST_CERTIFICATE', selector: 'button#request-certificate-pdf', description: 'Branch: Download CA Certificate of Status PDF' },
            { stepNumber: 13, action: 'LOG_RESULT', description: 'Log CA workflow completion metrics' }
        ]
    },
    NY: {
        stateCode: 'NY',
        stateName: 'New York',
        portalUrl: 'https://apps.dos.ny.gov/publicInquiry/',
        steps: [
            { stepNumber: 1, action: 'GOTO', value: 'https://apps.dos.ny.gov/publicInquiry/', description: 'Navigate to NY Dept of State Corporation Inquiry' },
            { stepNumber: 2, action: 'ASSERT_DOM', selector: '#EntityName', description: 'Assert NY Entity Name search field present' },
            { stepNumber: 3, action: 'FILL', selector: '#EntityName', value: '{BUSINESS_NAME}', description: 'Fill entity name into NY DOS query field' },
            { stepNumber: 4, action: 'CLICK', selector: '#btnSearch', description: 'Click NY search submit button' },
            { stepNumber: 5, action: 'ASSERT_DOM', selector: '#gridResults table', description: 'Assert NY inquiry grid results loaded' },
            { stepNumber: 6, action: 'CLICK', selector: '#gridResults tbody tr:first-child a', description: 'Select NY entity from search table' },
            { stepNumber: 7, action: 'ASSERT_DOM', selector: '#lblEntityStatus', description: 'Assert NY DOS detail panel rendered' },
            { stepNumber: 8, action: 'SCREENSHOT', description: 'Capture NY entity inquiry detail screenshot' },
            { stepNumber: 9, action: 'READ_STATUS', selector: '#lblEntityStatus', description: 'Parse raw NY entity status text' },
            { stepNumber: 10, action: 'NAVIGATE_FILING', selector: '#biennialStatementLink', description: 'Branch: Navigate to NY Biennial Statement Filing portal' },
            { stepNumber: 11, action: 'READ_AMOUNT_OWED', selector: '#lblFeeAmountDue', value: '$9.00', description: 'Branch: Capture NY biennial statement past due fee' },
            { stepNumber: 12, action: 'REQUEST_CERTIFICATE', selector: '#btnDownloadCertificate', description: 'Branch: Generate free NY Certificate of Status PDF' },
            { stepNumber: 13, action: 'LOG_RESULT', description: 'Log NY entity status verification data' }
        ]
    },
    TX: {
        stateCode: 'TX',
        stateName: 'Texas',
        portalUrl: 'https://mycpa.cpa.state.tx.us/coa/',
        steps: [
            { stepNumber: 1, action: 'GOTO', value: 'https://mycpa.cpa.state.tx.us/coa/', description: 'Navigate to Texas Comptroller Franchise Tax Search' },
            { stepNumber: 2, action: 'ASSERT_DOM', selector: 'input#entityNameInput', description: 'Assert TX CPA entity input present' },
            { stepNumber: 3, action: 'FILL', selector: 'input#entityNameInput', value: '{BUSINESS_NAME}', description: 'Fill search query into TX CPA input box' },
            { stepNumber: 4, action: 'CLICK', selector: 'input#btnSearchCoa', description: 'Click TX search submission button' },
            { stepNumber: 5, action: 'ASSERT_DOM', selector: 'table#coaResults', description: 'Assert TX search results grid rendered' },
            { stepNumber: 6, action: 'CLICK', selector: 'table#coaResults tr.resultRow a', description: 'Click TX taxable entity detail view' },
            { stepNumber: 7, action: 'ASSERT_DOM', selector: 'span.rightToTransactStatus', description: 'Assert TX Right to Transact Status field visible' },
            { stepNumber: 8, action: 'SCREENSHOT', description: 'Capture screenshot of TX Franchise Tax portal status' },
            { stepNumber: 9, action: 'READ_STATUS', selector: 'span.rightToTransactStatus', description: 'Read TX Right to Transact Business status text' },
            { stepNumber: 10, action: 'NAVIGATE_FILING', selector: 'a#linkFranchiseTaxReport', description: 'Branch: Navigate to TX Webfile Franchise Tax filing portal' },
            { stepNumber: 11, action: 'READ_AMOUNT_OWED', selector: 'div.franchiseTaxBalance', value: '$150.00', description: 'Branch: Read outstanding TX franchise tax balance' },
            { stepNumber: 12, action: 'REQUEST_CERTIFICATE', selector: 'a.downloadFactCert', description: 'Branch: Request TX Certificate of Fact PDF' },
            { stepNumber: 13, action: 'LOG_RESULT', description: 'Log TX entity compliance execution report' }
        ]
    },
    FL: {
        stateCode: 'FL',
        stateName: 'Florida',
        portalUrl: 'https://search.sunbiz.org/Inquiry/CorporationSearch/ByName',
        steps: [
            { stepNumber: 1, action: 'GOTO', value: 'https://search.sunbiz.org/Inquiry/CorporationSearch/ByName', description: 'Navigate to Florida Sunbiz Corporation Inquiry' },
            { stepNumber: 2, action: 'ASSERT_DOM', selector: '#SearchTerm', description: 'Assert FL Sunbiz search box rendered' },
            { stepNumber: 3, action: 'FILL', selector: '#SearchTerm', value: '{BUSINESS_NAME}', description: 'Fill search query into FL Sunbiz search form' },
            { stepNumber: 4, action: 'CLICK', selector: "form button[type='submit']", description: 'Submit FL Sunbiz entity inquiry' },
            { stepNumber: 5, action: 'ASSERT_DOM', selector: '.search-results-container table', description: 'Assert FL search result list loaded' },
            { stepNumber: 6, action: 'CLICK', selector: '.search-results-container table tbody tr:first-child td a', description: 'Click FL entity detail link' },
            { stepNumber: 7, action: 'ASSERT_DOM', selector: '.detail-section .status-value', description: 'Assert FL entity details page loaded' },
            { stepNumber: 8, action: 'SCREENSHOT', description: 'Capture screenshot of Sunbiz detail record' },
            { stepNumber: 9, action: 'READ_STATUS', selector: '.detail-section .status-value', description: 'Read FL Sunbiz legal status tag' },
            { stepNumber: 10, action: 'NAVIGATE_FILING', selector: '#annual-report-efile-link', description: 'Branch: Navigate to FL Annual Report e-Filing portal' },
            { stepNumber: 11, action: 'READ_AMOUNT_OWED', selector: '.annual-report-due-amount', value: '$138.75', description: 'Branch: Extract FL annual report late fee & balance' },
            { stepNumber: 12, action: 'REQUEST_CERTIFICATE', selector: '#btnCertStatusPDF', description: 'Branch: Generate Florida Certificate of Status PDF' },
            { stepNumber: 13, action: 'LOG_RESULT', description: 'Log FL entity compliance run step telemetry' }
        ]
    }
};
//# sourceMappingURL=dsl-workflows.js.map
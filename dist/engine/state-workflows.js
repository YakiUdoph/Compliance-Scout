export const STATE_PROMPTS = {
    DE: {
        stateCode: 'DE',
        stateName: 'Delaware',
        agencyName: 'Delaware Division of Corporations',
        portalUrl: 'https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx',
        maxSteps: 15,
        promptTemplate: `Navigate to Delaware ICIS Corp portal at https://icis.corp.delaware.gov/Ecorp/EntitySearch/NameSearch.aspx.
1. Enter the business name "{BUSINESS_NAME}" or entity number "{ENTITY_NUMBER}" into the Entity Name search input field.
2. Click the Submit button to execute the search query.
3. Wait for search results to populate in the result grid. Click on the matching business entity link.
4. On the Entity Detail page, read and extract the raw legal status text (e.g., "Active", "In Good Standing", "Forfeited", "Revoked").
5. Take a screenshot of the entity detail view.
6. IF status indicates delinquent or taxes due: Navigate to the Tax Payment section, read the outstanding Delaware Franchise Tax balance owed (stop before submitting payment), and record the payment URL.
7. ELSE IF status is In Good Standing: Click the Request Certificate of Good Standing button and download the official PDF.`
    },
    CA: {
        stateCode: 'CA',
        stateName: 'California',
        agencyName: 'California Secretary of State (bizfileOnline)',
        portalUrl: 'https://bizfileonline.sos.ca.gov/search/business',
        maxSteps: 15,
        promptTemplate: `Navigate to California bizfileOnline search portal at https://bizfileonline.sos.ca.gov/search/business.
1. Type the business name "{BUSINESS_NAME}" or entity number "{ENTITY_NUMBER}" into the business search input field.
2. Click the Search button.
3. Wait for the search results table to load. Click the primary link for the matching entity.
4. On the Entity Detail page, read the status badge (e.g., "Active", "FTB Suspended", "SOS Suspended", "Dissolved").
5. Take a screenshot of the entity record page.
6. IF status is suspended or statement of information is past due: Click the Statement of Information link, read the penalty fee and amount due (e.g., "$800.00"), and log the filing link.
7. ELSE: Click the Request Certificate of Status button and download the PDF.`
    },
    NY: {
        stateCode: 'NY',
        stateName: 'New York',
        agencyName: 'New York Department of State (Division of Corporations)',
        portalUrl: 'https://apps.dos.ny.gov/publicInquiry/',
        maxSteps: 15,
        promptTemplate: `Navigate to New York Department of State Corporation Search at https://apps.dos.ny.gov/publicInquiry/.
1. Fill the Entity Name input box with "{BUSINESS_NAME}".
2. Click Search button.
3. Select the matching company row from the grid results.
4. Read the raw legal entity status text (e.g., "Active", "Inactive", "Past Due Date").
5. Capture a clear screenshot of the DOS entity inquiry result view.
6. IF past due on Biennial Statement: Navigate to the Biennial Statement portal, capture the filing fee owed (e.g., "$9.00"), and copy the filing link.
7. ELSE: Request the Certificate of Status PDF.`
    },
    TX: {
        stateCode: 'TX',
        stateName: 'Texas',
        agencyName: 'Texas Comptroller of Public Accounts',
        portalUrl: 'https://mycpa.cpa.state.tx.us/coa/',
        maxSteps: 15,
        promptTemplate: `Navigate to Texas Comptroller Taxable Entity Search at https://mycpa.cpa.state.tx.us/coa/.
1. Input "{BUSINESS_NAME}" or Texas Entity Number "{ENTITY_NUMBER}" into the Search Input field.
2. Click Search.
3. Click on the entity name link in the search results table.
4. Locate the "Right to Transact Business in Texas" field and read the raw text (e.g., "ACTIVE", "FRANCHISE TAX INACTIVE", "FORFEITED").
5. Take a screenshot of the Texas Comptroller detail view.
6. IF balance is due or right to transact is forfeited: Read the outstanding Franchise Tax balance (e.g., "$150.00") and log the Webfile filing link.
7. ELSE: Click Certificate of Fact and download the PDF.`
    },
    FL: {
        stateCode: 'FL',
        stateName: 'Florida',
        agencyName: 'Florida Department of State (Sunbiz)',
        portalUrl: 'https://search.sunbiz.org/Inquiry/CorporationSearch/ByName',
        maxSteps: 15,
        promptTemplate: `Navigate to Florida Sunbiz Corporation Inquiry at https://search.sunbiz.org/Inquiry/CorporationSearch/ByName.
1. Type "{BUSINESS_NAME}" into the Entity Name Search input box.
2. Click Search.
3. Click the first matching corporation link from the list.
4. Read the Status field in the Detail Section (e.g., "ACTIVE", "INACTIVE", "ADMIN DISSOLVED").
5. Capture a full screenshot of the Sunbiz corporate record page.
6. IF annual report is delinquent: Click the e-Filing Annual Report link, extract the late fee and balance owed (e.g., "$138.75"), and record the URL.
7. ELSE: Download the Certificate of Status PDF.`
    }
};
//# sourceMappingURL=state-workflows.js.map
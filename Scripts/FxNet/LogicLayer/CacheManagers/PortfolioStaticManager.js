define(
    "cachemanagers/PortfolioStaticManager",
    
    ["handlers/Delegate"],
    function TPortfolioStaticManager(delegate) {
        var onChange = new delegate(),
            portfolio = {
                maxExposure: 0,
                securities: 0,
                tradingBonus: 0,
                pendingBonus: 0,
                pendingWithdrawals: 0,
                kycStatus: 0,
                amlStatus: 0,
                cddStatus: 0,
                kycReviewStatus: 0,
                isDemo: 0,
                isActive: 0,
                pepStatus: 0,
                pendingBonusType: 0,
                spreadDiscountVolumePercentage: 0
            };

        function processData(data) {
            updateData(data);
            onChange.Invoke(portfolio);
        }

        function updateData(data) {
            portfolio.maxExposure = data[ePortfolioStatic.maxExposure];
            portfolio.securities = data[ePortfolioStatic.securities];
            portfolio.tradingBonus = data[ePortfolioStatic.tradingBonus];
            portfolio.pendingBonus = data[ePortfolioStatic.pendingBonus];
            portfolio.kycStatus = data[ePortfolioStatic.kycStatus];
            portfolio.amlStatus = data[ePortfolioStatic.amlStatus];
            portfolio.cddStatus = data[ePortfolioStatic.cddStatus];
            portfolio.kycReviewStatus = data[ePortfolioStatic.kycReviewStatus];
            portfolio.pendingWithdrawals = data[ePortfolioStatic.pendingWithdrawals];
            portfolio.isDemo = data[ePortfolioStatic.isDemo] === 1;
            portfolio.isActive = data[ePortfolioStatic.isActive] === 1;
            portfolio.pepStatus = data[ePortfolioStatic.pepStatus];
            portfolio.pendingBonusType = data[ePortfolioStatic.pendingBonusType];
            portfolio.spreadDiscountVolumePercentage = data[ePortfolioStatic.pendingBonusVolumePercentage];
        }

        return {
            Portfolio: portfolio,
            OnChange: onChange,
            ProcessData: processData
        };
    }
);
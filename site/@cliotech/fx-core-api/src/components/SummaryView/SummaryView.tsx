/** we first import vendor packages */
import React, { FunctionComponent } from "react";
import cn from "classnames";
import { observer } from "mobx-react-lite";

/** then components */
import SummaryActionItem from "./SummaryEntry";
import Currency from "../Currency/Currency";
import IfCondition from "../IfCondition/IfConditions";
import FxComponentDemoIcon from "../FxComponentDemoIcon/FxComponentDemoIcon";
import LiveCashBack from "../LiveCashBack/LiveCashBack";
import AccountSummaryNotActive from "../AccountSummaryNotActive/AccountSummaryNotActive";
import Translate from "../Translate/Translate";

/** finally the viewmodel */
import { useSummaryStoreData } from "./SummaryViewModel";
import { toNumeric } from "../Currency/currencyHelpers";

export const SummaryView: FunctionComponent = () => {
  const data = useSummaryStoreData();

  return (
    <React.Fragment>
      <div>
        <div>
          <div className="header">
            <Translate
              el="div"
              id="accSummaryTitle"
              className="accountSummaryTitle"
              value="accSummaryTitle"
              context="summaryview_accountsummary"
            />

            {data.financialSummaryDetailsVisibility && (
              <div className="accountSummaryMode">
                <ul>
                  {!data.advancedWalletView ? (
                    <li>
                      <a
                        className="ExpandDiv"
                        id="ASExpend"
                        onClick={data.useToggleAdvancedView}
                        href="javascript:void(0)"
                      >
                        <Translate
                          el="span"
                          id="hlExpand"
                          value="btnAdvancedView"
                          context="summaryview_accountsummary"
                        />{" "}
                        <i className="ico-wb-plus" />
                      </a>
                    </li>
                  ) : (
                    <li>
                      <a
                        className="CollapseDiv"
                        id="ASCollapse"
                        onClick={data.useToggleAdvancedView}
                        href="javascript:void(0)"
                      >
                        <Translate
                          el="span"
                          id="hlCollapse"
                          value="btnSimpleView"
                          context="summaryview_accountsummary"
                        />{" "}
                        <i className="ico-wb-remove" />
                      </a>
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <div id="AccountSummaryTblArea">
            <div className="viewport">
              {data.financialSummaryDetailsVisibility ? (
                <div className="overview">
                  <table
                    id="AccountSummaryTbl"
                    className={cn({
                      pendingBonus: data.pendingBonusCss,
                    })}
                  >
                    <tbody>
                      <tr className="bordered">
                        <td>
                          <SummaryActionItem
                            head={true}
                            id={"accSummaryMarginTitle"}
                            text={data.getValue(
                              "accSummaryMarginTitle",
                              "summaryview_accountsummary"
                            )}
                            toolTip={data.getValue(
                              "accSummaryAvailableMarginToolTip",
                              "summaryview_accountsummary"
                            )}
                            plusAction={data.showAvailableMargin}
                          />
                        </td>
                        <td>
                          <Currency
                            id="accSummaryMargin"
                            className="ltr"
                            decorate={true}
                          >
                            {data.availableMargin}
                          </Currency>
                        </td>
                      </tr>
                      {data.usedMarginVisibility && (
                        <tr>
                          <td>
                            <SummaryActionItem
                              id={"accSummaryUsedMarginTitle"}
                              text={data.getValue(
                                "accSummaryUsedMarginTitle",
                                "summaryview_accountsummary"
                              )}
                              toolTip={data.getValue(
                                "accSummaryUsedMarginToolTip",
                                "summaryview_accountsummary"
                              )}
                              plusAction={data.showUsedMargin}
                            />
                          </td>
                          <td>
                            <Currency id="accSummaryUsedMargin" className="ltr">
                              {data.usedMargin}
                            </Currency>
                          </td>
                        </tr>
                      )}
                      {data.advancedWalletView && (
                        <tr>
                          <td>
                            <SummaryActionItem
                              id={"accSummaryMarginUtilizationTitle"}
                              text={data.getValue(
                                "accSummaryMarginUtilizationTitle",
                                "summaryview_accountsummary"
                              )}
                              toolTip={data.getValue(
                                "accSummaryMarginUtilizationToolTip",
                                "summaryview_accountsummary"
                              )}
                              plusAction={data.showUsedMargin}
                            />
                          </td>
                          <td>
                            <Currency
                              id="accSummaryMarginUtilization"
                              showPercent={true}
                            >
                              {data.marginUtilizationPercentage}
                            </Currency>
                          </td>
                        </tr>
                      )}

                      <IfCondition condition={data.marginLevel.isVisible}>
                        <tr className="MarginLevelDisplay">
                          <td>
                            <SummaryActionItem
                              id={"accSummaryMarginLevelTitle"}
                              text={data.getValue(
                                "accSummaryMarginLevelTitle",
                                "summaryview_accountsummary"
                              )}
                            />
                          </td>
                          <td>
                            <Currency id="accSummaryEquity">
                              {`${data.marginLevel.value}`}
                            </Currency>
                          </td>
                        </tr>
                      </IfCondition>

                      <tr className="bordered">
                        <td>
                          <SummaryActionItem
                            id={"AccSummaryEquityTitle"}
                            text={data.getValue(
                              "AccSummaryEquityTitle",
                              "summaryview_accountsummary"
                            )}
                            head={true}
                            toolTip={data.getValue(
                              "accSummaryEquityTooltip",
                              "summaryview_accountsummary"
                            )}
                          />
                        </td>
                        <td className="equity-value-wrapper">
                          <IfCondition condition={data.isDemo}>
                            <FxComponentDemoIcon />
                          </IfCondition>
                          <div className="equity-value-span-wrapper">
                            <Currency
                              className={cn("ltr", {
                                redText: toNumeric(data.equity) < 0,
                                greenText: toNumeric(data.equity) >= 0,
                              })}
                              id="accSummaryEquity"
                            >
                              {data.equity}
                            </Currency>
                          </div>
                        </td>
                      </tr>

                      {data.advancedWalletView && (
                        <tr>
                          <td>
                            <SummaryActionItem
                              id={"accSummaryAccountBalanceTitle"}
                              text={data.getValue(
                                "accSummaryAccountBalanceTitle",
                                "summaryview_accountsummary"
                              )}
                            />
                          </td>
                          <td>
                            <Currency
                              className="ltr"
                              id="accSummaryAccountBalance"
                            >
                              {data.accountBalance}
                            </Currency>
                          </td>
                        </tr>
                      )}
                      {data.tradingBonusVisibility && (
                        <tr>
                          <td>
                            <SummaryActionItem
                              id={"accSummaryTradingBonusTitle"}
                              text={data.getValue(
                                "accSummaryTradingBonusTitle",
                                "summaryview_accountsummary"
                              )}
                              toolTip={data.getValue(
                                "accSummaryTradingBonusToolTip",
                                "summaryview_accountsummary"
                              )}
                            />
                          </td>
                          <td>
                            <Currency
                              className="greeText ltr"
                              id="accSummaryTradingBonus"
                            >
                              {data.tradingBonus}
                            </Currency>
                          </td>
                        </tr>
                      )}
                      {!data.advancedWalletView && (
                        <tr className="bordered">
                          <td>
                            <SummaryActionItem
                              id={"accSummaryOpenPLTitle"}
                              head={true}
                              text={data.getValue(
                                "accSummaryOpenPLTitle",
                                "summaryview_accountsummary"
                              )}
                              toolTip={data.getValue(
                                "accSummaryOpenPLTooltip",
                                "summaryview_accountsummary"
                              )}
                            />
                          </td>
                          <td>
                            <Currency
                              className="ltr"
                              id="accSummaryOpenPL"
                              decorate={true}
                            >
                              {data.openPL}
                            </Currency>
                          </td>
                        </tr>
                      )}

                      <tr className="exposure-coverage bordered">
                        <td colSpan={2}>
                          <SummaryActionItem
                            id={"accSummaryExposureCoverageTitle"}
                            head={true}
                            text={data.getValue(
                              "accSummaryExposureCoverageTitle",
                              "summaryview_accountsummary"
                            )}
                            toolTip={data.getValue(
                              data.maintenanceMarginPercentage > 0
                                ? "accSummaryExposureCoverageWhenMaintenanceMarginTooltip"
                                : "accSummaryExposureCoverageTooltip",
                              "summaryview_accountsummary"
                            )}
                          />

                          <span className="exposure_percent">
                            <Currency
                              className={cn("ltr", {
                                redText: !data.isValidExposureCoverage,
                              })}
                              id="accSummaryExposureCoverage"
                              toppedPercent={true}
                            >
                              {data.exposureCoverage}
                            </Currency>
                          </span>
                        </td>
                      </tr>

                      {data.maintenanceMarginVisibility && (
                        <tr>
                          <td>
                            <SummaryActionItem
                              id={"accSummaryMaintenanceMarginTitle"}
                              text={data.getValue(
                                "accSummaryMaintenanceMarginTitle",
                                "summaryview_accountsummary"
                              )}
                              toolTip={data.getValue(
                                "accSummaryMaintenanceMarginTooltip",
                                "summaryview_accountsummary"
                              )}
                            />
                          </td>
                          <td>
                            <Currency
                              className="ltr"
                              id="accSummaryMaintenanceMargin"
                            >
                              {data.maintenanceMargin}
                            </Currency>
                          </td>
                        </tr>
                      )}
                      {data.advancedWalletView && (
                        <tr>
                          <td>
                            <SummaryActionItem
                              id={"accSummaryNetExposureTitle"}
                              text={data.getValue(
                                "accSummaryNetExposureTitle",
                                "summaryview_accountsummary"
                              )}
                              plusAction={data.showExposureSummary}
                            />
                          </td>
                          <td>
                            <Currency
                              className="ltr"
                              id="accSummaryNetExposure"
                              decimals={0}
                            >
                              {data.netExposure}
                            </Currency>
                          </td>
                        </tr>
                      )}
                      {data.advancedWalletView && (
                        <tr>
                          <td>
                            <SummaryActionItem
                              id={"accSummaryMaxExposureTitle"}
                              text={data.getValue(
                                "accSummaryMaxExposureTitle",
                                "summaryview_accountsummary"
                              )}
                            />
                          </td>
                          <td>
                            <Currency
                              className="ltr"
                              id="accSummaryMaxExposure"
                              decimals={0}
                            >
                              {data.maxExposure}
                            </Currency>
                          </td>
                        </tr>
                      )}
                      {data.advancedWalletView && (
                        <tr className="bordered">
                          <td>
                            <SummaryActionItem
                              id={"accSummaryOpenPLTitle"}
                              head={true}
                              text={data.getValue(
                                "accSummaryOpenPLTitle",
                                "summaryview_accountsummary"
                              )}
                              toolTip={data.getValue(
                                "accSummaryOpenPLTooltip",
                                "summaryview_accountsummary"
                              )}
                            />
                          </td>
                          <td>
                            <Currency
                              className="ltr"
                              id="accSummaryOpenPL"
                              decorate={true}
                            >
                              {data.openPL}
                            </Currency>
                          </td>
                        </tr>
                      )}
                      {data.cashBackVisibility && (
                        <tr className="bordered">
                          <td colSpan={2}>
                            <div id="live-cash-back">
                              <div className="cashback-wrapper right">
                                <SummaryActionItem
                                  id={"accSummaryPendingBonusTitle"}
                                  head={true}
                                  text={data.getValue(
                                    "accSummaryPendingBonusTitle",
                                    "summaryview_accountsummary"
                                  )}
                                  toolTip={data.getValue(
                                    "accSummaryPendingBonusTitle",
                                    "summaryview_accountsummary"
                                  )}
                                  plusAction={data.showCashBack}
                                />

                                <LiveCashBack />
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}

                      {data.pendingWithdrawalsVisibility && (
                        <tr
                          id="trAccSummaryPendingWithdrawals"
                          className="bordered"
                        >
                          <td>
                            <SummaryActionItem
                              id={"accSummaryPendingWithdrawalsTitle"}
                              head={true}
                              text={data.getValue(
                                "accSummaryPendingWithdrawalsTitle",
                                "summaryview_accountsummary"
                              )}
                              toolTip={data.getValue(
                                "accSummaryPendingWithdrawalsToolTip",
                                "summaryview_accountsummary"
                              )}
                              rightAction={data.useSwitchViewVisible}
                            />
                          </td>
                          <td>
                            <Currency
                              className="ltr"
                              id="accSummaryPendingWithdrawals"
                              decimals={0}
                            >
                              {data.pendingWithdrawals}
                            </Currency>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <AccountSummaryNotActive />
              )}
            </div>
          </div>
        </div>
        <div className="ActionDiv">
          <div className="AccSummaryExpandCollapse">
            {data.financialSummaryDetailsVisibility && (
              <a
                id="btnDeposit"
                className="btn action deposit"
                onClick={data.useRedirectToForm}
              >
                <p className="center">
                  {data.getValue("btnDeposit", "summaryview_accountsummary")}
                </p>
              </a>
            )}
          </div>
        </div>
      </div>
    </React.Fragment>
  );
};

export default observer(SummaryView);

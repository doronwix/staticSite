define("managers/instrumentTranslationsManager", [
	"require",
	"generalmanagers/ErrorManager",
	"initdatamanagers/InstrumentsManager",
	"handlers/languageHelper",
	"Dictionary",
	"vendor/latinize",
], function (require) {
	var ErrorManager = require("generalmanagers/ErrorManager"),
		InstrumentsManager = require("initdatamanagers/InstrumentsManager"),
		LanguageHelper = require("handlers/languageHelper"),
		Dictionary = require("Dictionary"),
		latinize = require("vendor/latinize");

	function TInstrumentTranslation(instrumentId) {
		this.ccyPairLong = Dictionary.GetGlobalItem("instr_" + instrumentId, "*");
		this.ccyPairShort = Dictionary.GetGlobalItem("instr_basic_" + instrumentId, "*");
		this.ccyPairOriginal = Dictionary.GetGlobalItem("instr_raw_" + instrumentId, "*");

		this.baseSymbolName = this.ccyPairOriginal.split(/\//g)[0];
		this.otherSymbolName = this.ccyPairOriginal.split(/\//g)[1];
	}

	function InstrumentTranslationsManager() {
		function getTranslatedInstrument(instrumentId) {
			return new TInstrumentTranslation(instrumentId);
		}

		function getTooltipByInstrumentId(instrumentId) {
			var prefix = "symboltooltip_",
				inst = InstrumentsManager.GetInstrument(instrumentId),
				contractMonthAndYear = inst.contractMonthAndYear || "",
				baseSymbolName = inst.baseSymbolName ? inst.baseSymbolName.toLowerCase() : "",
				otherSymbolName = inst.otherSymbolName ? inst.otherSymbolName.toLowerCase() : "";

			if (Dictionary.ValueIsEmpty(prefix + baseSymbolName + otherSymbolName)) {
				return inst.baseSymbolName + "/" + inst.otherSymbolName;
			}

			return (
				Dictionary.GetGlobalItem(prefix + baseSymbolName + otherSymbolName) +
				buildContractMonth(contractMonthAndYear, instrumentId)
			);
		}

		function buildContractMonth(contractMonthAndYear, instrumentId) {
			if (!contractMonthAndYear) {
				return "";
			}

			var year = contractMonthAndYear.substr(-2),
				yearDigit = contractMonthAndYear.substr(-1),
				month = contractMonthAndYear.split(" ")[0];

			month = month ? month.slice(0, 3).toUpperCase() : month;

			var monthCodes = {
					JAN: "F",
					FEB: "G",
					MAR: "H",
					APR: "J",
					MAY: "K",
					JUN: "M",
					JUL: "N",
					AUG: "Q",
					SEP: "U",
					OCT: "V",
					NOV: "X",
					DEC: "Z",
				},
				monthCode = monthCodes[month];

			if (!monthCode) {
				month = "-";
				monthCode = "-";

				ErrorManager.onWarning(
					"InstrumentTranslationsManager/buildContractMonth",
					String.format(
						"Instrument {0} does not have a valid contract month: [{1}].",
						instrumentId,
						contractMonthAndYear
					)
				);
			}

			return String.format(" {0}{1} {4}({2}{3}){4}", month, year, monthCode, yearDigit, cTextMarks.Ltr);
		}

		function short(instId) {
			var translation = getTranslatedInstrument(instId).ccyPairShort;

			return addLTRMarksToNonArabicTextInRTLLanguages(translation);
		}

		function long(instId) {
			var translation = getTranslatedInstrument(instId).ccyPairLong;

			return addLTRMarksToNonArabicTextInRTLLanguages(translation);
		}

		function addLTRMarksToNonArabicTextInRTLLanguages(translation) {
			if (!LanguageHelper.IsRtlLanguage() || (translation && translation.isRtlText())) {
				return translation;
			}

			translation = String.format("{1}{0}{1}", translation, cTextMarks.Ltr);
			return translation;
		}

		function original(instId) {
			return getTranslatedInstrument(instId).ccyPairOriginal;
		}

		function getFullTextLatinized(instId) {
			var instr = getTranslatedInstrument(instId),
				noSlashName = instr.baseSymbolName + instr.otherSymbolName,
				instrumentTooltip = getTooltipByInstrumentId(instId),
				instrument = InstrumentsManager.GetInstrument(instId);

			return latinize(
				instr.ccyPairShort +
					" " +
					instr.ccyPairLong +
					" " +
					noSlashName +
					" " +
					instrumentTooltip +
					(instrument ? " " + instrument.instrumentEnglishName : "")
			);
		}

		return {
			GetTooltipByInstrumentId: getTooltipByInstrumentId,
			GetTranslatedInstrumentById: getTranslatedInstrument,
			Long: long,
			Short: short,
			Original: original,
			GetFullTextLatinized: getFullTextLatinized,
		};
	}

	var module = (window.$instrumentTranslationsManager = new InstrumentTranslationsManager());

	return module;
});

import { runOperationCheck } from "./lib/operation-check";

async function main() {
  const result = await runOperationCheck();

  console.log("==========================================");
  console.log(" LOTTO WEEKLY OPERATION CHECK             ");
  console.log("==========================================");
  console.log("");
  console.log(`Local latest       : 제${result.localLatestDrawNo}회`);
  console.log(`Latest draw date   : ${result.latestDrawDate}`);
  console.log(`Next expected      : 제${result.nextExpectedDrawNo}회`);
  console.log(`Expected date      : ${result.expectedDrawDate}`);
  console.log("");
  console.log(`Remote status      : ${result.remoteStatusText}`);
  console.log(`Dataset validation : ${result.datasetValidationText}`);
  console.log(`Regression status  : ${result.regressionStatusText}`);
  console.log("");
  console.log("Recommended action:");
  console.log(result.recommendedAction);
  console.log("");
  if (result.errors.length > 0) {
    console.error("[ERRORS / WARNINGS]");
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
    console.log("");
  }
  console.log("==========================================");

  process.exit(result.exitCode);
}

main();

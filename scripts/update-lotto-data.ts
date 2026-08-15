import { runUpdatePipeline } from "./lib/update-pipeline";

interface CommandArgs {
  isDryRun: boolean;
  isValidateOnly: boolean;
  targetDrawArg?: number;
}

function parseArgs(): CommandArgs {
  const args = process.argv.slice(2);
  let isDryRun = false;
  let isValidateOnly = false;
  let targetDrawArg: number | undefined = undefined;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--dry-run") {
      isDryRun = true;
    } else if (args[i] === "--validate-only") {
      isValidateOnly = true;
    } else if (args[i] === "--draw" && args[i + 1]) {
      targetDrawArg = Number(args[i + 1]);
      i++;
    }
  }

  return { isDryRun, isValidateOnly, targetDrawArg };
}

async function main() {
  const { isDryRun, isValidateOnly, targetDrawArg } = parseArgs();

  console.log("==========================================");
  console.log("   LOTTO DRAW DATA UPDATE PIPELINE      ");
  console.log("==========================================");

  if (isDryRun) {
    console.log("Mode: DRY-RUN (파일 수정 없음)");
  } else if (isValidateOnly) {
    console.log("Mode: VALIDATE-ONLY (로컬 무결성 검증)");
  } else {
    console.log("Mode: ACTUAL UPDATE (원자적 파일 교체)");
  }

  const result = await runUpdatePipeline({
    isDryRun,
    isValidateOnly,
    targetDrawArg,
  });

  console.log("\n--- 실행 결과 요약 ---");
  console.log(`Current latest draw : 제${result.localLatestDrawNo}회`);
  console.log(`Target/Next draw    : 제${result.targetDrawNo}회`);
  console.log(`Pipeline Status     : ${result.status}`);
  console.log(`Message             : ${result.message}`);

  if (result.addedDrawsCount > 0) {
    console.log(`\nFound ${result.addedDrawsCount} new draw(s):`);
    for (const draw of result.addedDraws) {
      console.log(
        `  ✓ 제${draw.drawNo}회 (${draw.drawDate}) 당첨번호: ${draw.numbers.join(", ")} + 보너스 ${draw.bonus}`
      );
    }
  }

  if (result.warnings.length > 0) {
    console.log("\n[WARNINGS]");
    for (const warn of result.warnings) {
      console.log(`  - ${warn}`);
    }
  }

  if (result.errors.length > 0) {
    console.error("\n[ERRORS]");
    for (const err of result.errors) {
      console.error(`  - ${err}`);
    }
  }

  console.log("==========================================");

  process.exit(result.exitCode);
}

main();

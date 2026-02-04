import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

// npx tsx prisma/scripts/excel-to-users.ts prisma/data/data-users.xlsx

interface ExcelRow {
  No: number;
  Nama: string;
  NID: string;
  "Sub Bidang": string;
  Email: string;
}

function convertExcelToUsersCode(excelFilePath: string): string {
  // Baca file Excel
  const workbook = XLSX.readFile(excelFilePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];

  // Convert ke JSON
  const data: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

  // Generate TypeScript code
  let code = `    // AUTO-GENERATED FROM EXCEL - DO NOT EDIT MANUALLY\n`;

  data.forEach((row) => {
    const name = row.Nama?.trim() || "";
    const nid = row.NID?.toString().trim() || "";
    const bidang = row["Sub Bidang"]?.trim() || "";
    const email = row.Email?.trim() || "";

    if (!name || !nid || !email) {
      console.warn(`⚠️ Skipping incomplete row: ${JSON.stringify(row)}`);
      return;
    }

    code += `    {\n`;
    code += `      name: "${name}",\n`;
    code += `      email: "${email}",\n`;
    code += `      password: await bcrypt.hash("pic123", 10),\n`;
    code += `      role: Role.PIC,\n`;
    code += `      nid: "${nid}",\n`;
    code += `      bidang: "${bidang}",\n`;
    code += `    },\n`;
  });

  return code;
}

// Main execution
const excelPath = process.argv[2];

if (!excelPath) {
  console.error(
    "❌ Usage: tsx prisma/scripts/excel-to-users.ts ./data/data-users.xlsx",
  );
  process.exit(1);
}

if (!fs.existsSync(excelPath)) {
  console.error(`❌ File not found: ${excelPath}`);
  process.exit(1);
}

console.log(`📊 Reading Excel file: ${excelPath}`);
const generatedCode = convertExcelToUsersCode(excelPath);

// Save to output file
const outputPath = path.join(__dirname, "../data/generated-users.txt");
fs.writeFileSync(outputPath, generatedCode);

console.log(`✅ Generated code saved to: ${outputPath}`);
console.log(`\n📋 Copy this code and paste it into prisma/data/users.ts`);

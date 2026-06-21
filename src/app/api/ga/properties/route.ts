import { NextResponse } from "next/server";

export async function GET() {
  const properties = [
    {
      id: "properties/501072751",
      name: "Inflectiv App",
      account: "Inflectiv Analytics",
    },
    {
      id: "properties/448055843",
      name: "Inflectiv Website",
      account: "Inflectiv Analytics",
    },
  ];

  return NextResponse.json({ properties });
}

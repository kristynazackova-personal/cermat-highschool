import { NextRequest } from "next/server";
import { handlers } from "@/auth";

/**
 * Za Railway se web o sobě sám nedozví, na jaké adrese běží.
 *
 * Next sestaví adresu požadavku z toho, na čem uvnitř kontejneru poslouchá
 * — tedy z localhost a portu — a knihovna na přihlašování z ní odvodí
 * návratovou adresu, kterou pošle Googlu. Ten ji odmítne: localhost se
 * jako návratová adresa zaregistrovat nedá, takže žádné nastavení na
 * straně Googlu to nespraví.
 *
 * Skutečnou adresu zná jen hlavička, kterou přidává Railway. Přepíšeme
 * proto adresu požadavku podle ní, ještě než se k němu knihovna dostane.
 * Díky tomu web funguje na kterékoli doméně, na které ho někdo zveřejní,
 * a nemusí se nikde nastavovat adresa ručně.
 */
function podleHlavicek(req: NextRequest): NextRequest {
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  if (!host) return req;
  const protokol = req.headers.get("x-forwarded-proto") ?? "https";

  const url = new URL(req.url);
  if (url.host === host && url.protocol === `${protokol}:`) return req;
  url.protocol = `${protokol}:`;
  if (host.includes(":")) {
    url.host = host;
  } else {
    // samotné „host“ port nepřepíše, a vnitřní port kontejneru by se pak
    // propsal do návratové adresy (…up.railway.app:8080)
    url.hostname = host;
    url.port = "";
  }
  return new NextRequest(url, req);
}

export const GET = (req: NextRequest) => handlers.GET(podleHlavicek(req));
export const POST = (req: NextRequest) => handlers.POST(podleHlavicek(req));

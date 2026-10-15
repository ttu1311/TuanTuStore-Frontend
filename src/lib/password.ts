// Passwords of the FRONT-END DEMO.
//
// IMPORTANT: this is NOT real security, and it is not meant to be.
// The password is saved as plain text in the user record in the browser's localStorage, and "checking" a login
// simply compares it with what the visitor typed. There is no server that could keep a password secret:
// anyone who opens the browser developer tools can read every password and change any account.
// It only exists so the demo can show a login, a registration and a "change password" form that really work.
//
// It needs no browser feature at all (no Web Crypto), so it works the same on http://localhost,
// on a plain http://192.168.x.x address (a phone on the same Wi-Fi) and on https://.
// Never type a real password into this website.

// The same Vietnamese letter can be typed in different ways ("ế" as one character, or "e" + accent marks).
// NFKC makes them identical, so a password still matches whichever keyboard typed it.
function normalize(password: string) {
  return password.normalize("NFKC");
}

// Does the typed password match the saved one? `saved` is undefined for an old account that has no password.
export function isSamePassword(typed: string, saved: string | undefined) {
  return typeof saved === "string" && normalize(typed) === normalize(saved);
}

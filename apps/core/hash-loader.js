import S from 'saito-js/saito';

export default async (saito) => {
	saito.hash = (data) => S.hash(data);
	// if (!saito.BROWSER) {
	//   // eslint-disable-next-line @typescript-eslint/no-var-requires
	//   const blake3 = require("blake3");
	//   saito.hash = (data) => {
	//     return blake3.hash(data).toString("hex");
	//   };
	// } else {
	//   const blake3 = await import("blake3/browser");
	//   saito.hash = (data) => {
	//     // console.log(blake3);
	//     // console.log(data);
	//     return blake3.hash(data).toString("hex");
	//   };
	//
	// }
};

module.exports = async (saito) => {
    if (!saito.BROWSER) {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const blake3 = require('blake3');
        // const blake3 = await import ("blake3");
        saito.hash = (data) => {
            return blake3.hash(data).toString('hex');
        };

    } else {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        // const blake3 = require("blake3-js");
        // import('blake3/browser').then(blake3 => {
        //     saito.hash = (data) => {
        //         return blake3.hash(data).toString('hex');
        //     };
        // });
        let blake3 = await import('blake3/browser');
        saito.hash = (data) => {
            return blake3.hash(data).toString('hex');
        };
        // saito.hash = (data) => {
        //     return blake3.newRegular().update(data).finalize();
        // };
    }
}

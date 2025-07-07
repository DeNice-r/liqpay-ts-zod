import crypto from 'crypto';
import axios from 'axios';
import { CNBSchema } from './schemas';

const { env } = process;

const host = 'https://www.liqpay.ua/api/';
const buttonTranslations = { uk: 'Сплатити', en: 'Pay' };

export async function api(unverifiedParams: unknown, options: { path: string } = { path: 'checkout' }) {
    const { path } = options;
    const { params, data, signature } = getVerifiedData(unverifiedParams);

    const dataToSend = new URLSearchParams({
        data,
        signature,
    });

    try {
        await axios.post(`${host}${params.version}/${path}`, dataToSend, {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            timeout: 5000,
            maxRedirects: 0,
        });
    } catch (error: unknown) {
        if (
            axios.isAxiosError(error) &&
            error.response &&
            error.response.status === 302 &&
            typeof error.response.headers.location === 'string'
        ) {
            return error.response.headers?.location || '';
        }
    }

    throw new Error('Failed to get response from Liqpay');
}

export function getForm(unverifiedParams: unknown = {}) {
    const { params, data, signature } = getVerifiedData(unverifiedParams);

    const buttonText = buttonTranslations[params.language];

    return `
        <form method="POST" action="https://www.liqpay.ua/api/3/checkout" accept-charset="utf-8">
            <input type="hidden" name="data" value="${data}"/>
            <input type="hidden" name="signature" value="${signature}" />
            <script type="text/javascript" src="https://static.liqpay.ua/libjs/sdk_button.js"></script>
            <sdk-button label="${buttonText}" background="#77CC5D" onClick="submit()"></sdk-button>
        </form>
    `;
}

export function getVerifiedData(unverifiedParams: unknown) {
    const params = CNBSchema.parse(unverifiedParams);
    const data = Buffer.from(JSON.stringify(params)).toString('base64');
    const signature = signString(data);
    return { params, data, signature };
}

export function signString(str: string) {
    const sha1 = crypto.createHash('sha1');
    sha1.update(env.LIQPAY_PRIVATE_KEY + str + env.LIQPAY_PRIVATE_KEY);
    return sha1.digest('base64');
}

export function getCNBObject(params: unknown) {
    const { data, signature } = getVerifiedData(params);
    return { data, signature };
}

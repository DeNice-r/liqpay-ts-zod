import z from 'zod';

const { LIQPAY_PUBLIC_KEY = '', URL } = process.env;

export enum PaymentAction {
    PAY = 'pay',
    HOLD = 'hold',
    SUBSCRIBE = 'subscribe',
    PAYDONATE = 'paydonate',
}

export enum PaymentCurrency {
    UAH = 'UAH',
    USD = 'USD',
    EUR = 'EUR',
}

export enum PaymentLanguage {
    UK = 'uk',
    EN = 'en',
}

export enum LiqpayPeriodicity {
    DAY = 'day',
    MONTH = 'month',
    YEAR = 'year',
}

export const MaybeStringifiedNumberSchema = z.union([
    z
        .string()
        .transform((value) => {
            return Number(value);
        })
        .refine((value) => !isNaN(value)),
    z.number(),
]);
export const ShortStringSchema = z.string().min(1).max(200);

export const LiqpayAPIVersionSchema = z.number().int().min(1).max(3).default(3);
export const LiqpayAmountSchema = z
    .number()
    .int()
    .min(1)
    .max(10000)
    .default(20);

export const UserCNBSchema = z.object({
    amount: MaybeStringifiedNumberSchema.default(20).refine((value) => {
        const r = LiqpayAmountSchema.safeParse(value);
        return r.success;
    }),
    currency: z.nativeEnum(PaymentCurrency).default(PaymentCurrency.UAH),
    action: z.nativeEnum(PaymentAction).default(PaymentAction.PAY),
    subscribe_periodicity: z
        .nativeEnum(LiqpayPeriodicity)
        .default(LiqpayPeriodicity.MONTH),
});

export const CNBSchema = UserCNBSchema.extend({
    public_key: z
        .string()
        .refine((value) => value === LIQPAY_PUBLIC_KEY)
        .default(LIQPAY_PUBLIC_KEY),
    version: MaybeStringifiedNumberSchema.default(3).refine((value) => {
        const r = LiqpayAPIVersionSchema.safeParse(value);
        return r.success;
    }),
    description: ShortStringSchema.default('Пожертва команді Soulful'),
    language: z.nativeEnum(PaymentLanguage).default(PaymentLanguage.UK),
    subscribe_date_start: z.string().default('2024-01-01 00:00:00'),
    result_url: z.string().default(`${URL}/donate/thankyou`),
});

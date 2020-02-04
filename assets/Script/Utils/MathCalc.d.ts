type MathFunc = (x: number) => number;

class Expression {
    scope: { [key: string]: (number | MathFunc) };
    eval(): number;
}

export class MathCalc {
    parse(expr: string): Expression;
}

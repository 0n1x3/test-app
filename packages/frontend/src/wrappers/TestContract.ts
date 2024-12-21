import { Address, beginCell, Cell, Contract, ContractProvider, Sender, SendMode, toNano } from '@ton/core';

export class TestContract implements Contract {
    constructor(readonly address: Address) {}

    static createFromAddress(address: Address) {
        return new TestContract(address);
    }

    async getContractData(provider: ContractProvider) {
        const { stack } = await provider.get('get_contract_data', []);
        return {
            balance: stack.readBigNumber(),
            owner: stack.readAddress(),
        };
    }
} 
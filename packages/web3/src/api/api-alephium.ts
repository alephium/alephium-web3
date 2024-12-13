/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

/** AddressBalance */
export interface AddressBalance {
  /** @format address */
  address: string
  /** @format uint256 */
  balance: string
  /** @format x.x ALPH */
  balanceHint: string
  /** @format uint256 */
  lockedBalance: string
  /** @format x.x ALPH */
  lockedBalanceHint: string
}

/** AddressInfo */
export interface AddressInfo {
  /** @format address */
  address: string
  /** @format public-key */
  publicKey: string
  /** @format group-index */
  group: number
  path: string
}

/** Addresses */
export interface Addresses {
  /** @format address */
  activeAddress: string
  addresses: AddressInfo[]
}

/** AssetInput */
export interface AssetInput {
  outputRef: OutputRef
  /** @format hex-string */
  unlockScript: string
}

/** AssetOutput */
export interface AssetOutput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens: Token[]
  /** @format int64 */
  lockTime: number
  /** @format hex-string */
  message: string
  type: string
}

/** AssetState */
export interface AssetState {
  /** @format uint256 */
  attoAlphAmount: string
  tokens?: Token[]
}

/** BadRequest */
export interface BadRequest {
  detail: string
}

/** Balance */
export interface Balance {
  /** @format uint256 */
  balance: string
  /** @format x.x ALPH */
  balanceHint: string
  /** @format uint256 */
  lockedBalance: string
  /** @format x.x ALPH */
  lockedBalanceHint: string
  tokenBalances?: Token[]
  lockedTokenBalances?: Token[]
  /** @format int32 */
  utxoNum: number
}

/** Balances */
export interface Balances {
  /** @format uint256 */
  totalBalance: string
  /** @format x.x ALPH */
  totalBalanceHint: string
  balances: AddressBalance[]
}

/** Ban */
export interface Ban {
  peers: string[]
  type: string
}

/** Banned */
export interface Banned {
  /** @format int64 */
  until: number
  type: string
}

/** BlockAndEvents */
export interface BlockAndEvents {
  block: BlockEntry
  events: ContractEventByBlockHash[]
}

/** BlockEntry */
export interface BlockEntry {
  /** @format block-hash */
  hash: string
  /** @format int64 */
  timestamp: number
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int32 */
  height: number
  deps: string[]
  transactions: Transaction[]
  /** @format hex-string */
  nonce: string
  version: number
  /** @format 32-byte-hash */
  depStateHash: string
  /** @format 32-byte-hash */
  txsHash: string
  /** @format hex-string */
  target: string
  ghostUncles: GhostUncleBlockEntry[]
}

/** BlockHeaderEntry */
export interface BlockHeaderEntry {
  /** @format block-hash */
  hash: string
  /** @format int64 */
  timestamp: number
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int32 */
  height: number
  deps: string[]
}

/** BlocksAndEventsPerTimeStampRange */
export interface BlocksAndEventsPerTimeStampRange {
  blocksAndEvents: BlockAndEvents[][]
}

/** BlocksPerTimeStampRange */
export interface BlocksPerTimeStampRange {
  blocks: BlockEntry[][]
}

/** BrokerInfo */
export interface BrokerInfo {
  /** @format clique-id */
  cliqueId: string
  /** @format int32 */
  brokerId: number
  /** @format int32 */
  brokerNum: number
  /** @format inet-socket-address */
  address: {
    addr: string
    /** @format int32 */
    port: number
  }
}

/** BuildChainedDeployContractTx */
export interface BuildChainedDeployContractTx {
  value: BuildDeployContractTx
  type: string
}

/** BuildChainedDeployContractTxResult */
export interface BuildChainedDeployContractTxResult {
  value: BuildDeployContractTxResult
  type: string
}

/** BuildChainedExecuteScriptTx */
export interface BuildChainedExecuteScriptTx {
  value: BuildExecuteScriptTx
  type: string
}

/** BuildChainedExecuteScriptTxResult */
export interface BuildChainedExecuteScriptTxResult {
  value: BuildExecuteScriptTxResult
  type: string
}

/** BuildChainedTransferTx */
export interface BuildChainedTransferTx {
  value: BuildTransferTx
  type: string
}

/** BuildChainedTransferTxResult */
export interface BuildChainedTransferTxResult {
  value: BuildTransferTxResult
  type: string
}

/** BuildChainedTx */
export type BuildChainedTx = BuildChainedDeployContractTx | BuildChainedExecuteScriptTx | BuildChainedTransferTx

/** BuildChainedTxResult */
export type BuildChainedTxResult =
  | BuildChainedDeployContractTxResult
  | BuildChainedExecuteScriptTxResult
  | BuildChainedTransferTxResult

/** BuildDeployContractTx */
export interface BuildDeployContractTx {
  /** @format hex-string */
  fromPublicKey: string
  /** @format hex-string */
  fromPublicKeyType?: string
  /** @format hex-string */
  bytecode: string
  /** @format uint256 */
  initialAttoAlphAmount?: string
  initialTokenAmounts?: Token[]
  /** @format uint256 */
  issueTokenAmount?: string
  /** @format address */
  issueTokenTo?: string
  /** @format gas */
  gasAmount?: number
  /** @format uint256 */
  gasPrice?: string
  /** @format block-hash */
  targetBlockHash?: string
}

/** BuildDeployContractTxResult */
export interface BuildDeployContractTxResult {
  /** @format int32 */
  fromGroup: number
  /** @format int32 */
  toGroup: number
  unsignedTx: string
  /** @format gas */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  /** @format 32-byte-hash */
  txId: string
  /** @format address */
  contractAddress: string
}

/** BuildExecuteScriptTx */
export interface BuildExecuteScriptTx {
  /** @format hex-string */
  fromPublicKey: string
  /** @format hex-string */
  fromPublicKeyType?: string
  /** @format hex-string */
  bytecode: string
  /** @format uint256 */
  attoAlphAmount?: string
  tokens?: Token[]
  /** @format gas */
  gasAmount?: number
  /** @format uint256 */
  gasPrice?: string
  /** @format block-hash */
  targetBlockHash?: string
  /** @format double */
  gasEstimationMultiplier?: number
}

/** BuildExecuteScriptTxResult */
export interface BuildExecuteScriptTxResult {
  /** @format int32 */
  fromGroup: number
  /** @format int32 */
  toGroup: number
  unsignedTx: string
  /** @format gas */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  /** @format 32-byte-hash */
  txId: string
  simulatedOutputs: Output[]
}

/** BuildInfo */
export interface BuildInfo {
  releaseVersion: string
  commit: string
}

/** BuildMultiAddressesTransaction */
export interface BuildMultiAddressesTransaction {
  from: Source[]
  /** @format uint256 */
  gasPrice?: string
  /** @format block-hash */
  targetBlockHash?: string
}

/** BuildMultisig */
export interface BuildMultisig {
  /** @format address */
  fromAddress: string
  fromPublicKeys: string[]
  destinations: Destination[]
  /** @format gas */
  gas?: number
  /** @format uint256 */
  gasPrice?: string
}

/** BuildMultisigAddress */
export interface BuildMultisigAddress {
  keys: string[]
  /** @format int32 */
  mrequired: number
}

/** BuildMultisigAddressResult */
export interface BuildMultisigAddressResult {
  /** @format address */
  address: string
}

/** BuildSweepAddressTransactions */
export interface BuildSweepAddressTransactions {
  /** @format public-key */
  fromPublicKey: string
  /** @format address */
  toAddress: string
  /** @format uint256 */
  maxAttoAlphPerUTXO?: string
  /** @format int64 */
  lockTime?: number
  /** @format gas */
  gasAmount?: number
  /** @format uint256 */
  gasPrice?: string
  /** @format block-hash */
  targetBlockHash?: string
  /** @format int32 */
  utxosLimit?: number
}

/** BuildSweepAddressTransactionsResult */
export interface BuildSweepAddressTransactionsResult {
  unsignedTxs: SweepAddressTransaction[]
  /** @format int32 */
  fromGroup: number
  /** @format int32 */
  toGroup: number
}

/** BuildSweepMultisig */
export interface BuildSweepMultisig {
  /** @format address */
  fromAddress: string
  fromPublicKeys: string[]
  /** @format address */
  toAddress: string
  /** @format uint256 */
  maxAttoAlphPerUTXO?: string
  /** @format int64 */
  lockTime?: number
  /** @format gas */
  gasAmount?: number
  /** @format uint256 */
  gasPrice?: string
  /** @format int32 */
  utxosLimit?: number
  /** @format block-hash */
  targetBlockHash?: string
}

/** BuildTransferTx */
export interface BuildTransferTx {
  /** @format hex-string */
  fromPublicKey: string
  /** @format hex-string */
  fromPublicKeyType?: string
  destinations: Destination[]
  utxos?: OutputRef[]
  /** @format gas */
  gasAmount?: number
  /** @format uint256 */
  gasPrice?: string
  /** @format block-hash */
  targetBlockHash?: string
}

/** BuildTransferTxResult */
export interface BuildTransferTxResult {
  unsignedTx: string
  /** @format gas */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  /** @format 32-byte-hash */
  txId: string
  /** @format int32 */
  fromGroup: number
  /** @format int32 */
  toGroup: number
}

/** CallContract */
export interface CallContract {
  /** @format int32 */
  group: number
  /** @format block-hash */
  worldStateBlockHash?: string
  /** @format 32-byte-hash */
  txId?: string
  /** @format address */
  address: string
  /** @format address */
  callerAddress?: string
  /** @format int32 */
  methodIndex: number
  args?: Val[]
  interestedContracts?: string[]
  inputAssets?: TestInputAsset[]
}

/** CallContractFailed */
export interface CallContractFailed {
  error: string
  type: string
}

/** CallContractResult */
export type CallContractResult = CallContractFailed | CallContractSucceeded

/** CallContractSucceeded */
export interface CallContractSucceeded {
  returns: Val[]
  /** @format int32 */
  gasUsed: number
  contracts: ContractState[]
  txInputs: string[]
  txOutputs: Output[]
  events: ContractEventByTxId[]
  debugMessages: DebugMessage[]
  type: string
}

/** CallTxScript */
export interface CallTxScript {
  /** @format int32 */
  group: number
  /** @format hex-string */
  bytecode: string
  /** @format address */
  callerAddress?: string
  /** @format block-hash */
  worldStateBlockHash?: string
  /** @format 32-byte-hash */
  txId?: string
  inputAssets?: TestInputAsset[]
  interestedContracts?: string[]
}

/** CallTxScriptResult */
export interface CallTxScriptResult {
  returns: Val[]
  /** @format int32 */
  gasUsed: number
  contracts: ContractState[]
  txInputs: string[]
  txOutputs: Output[]
  events: ContractEventByTxId[]
  debugMessages: DebugMessage[]
}

/** ChainInfo */
export interface ChainInfo {
  /** @format int32 */
  currentHeight: number
}

/** ChainParams */
export interface ChainParams {
  networkId: number
  /** @format int32 */
  numZerosAtLeastInHash: number
  /** @format int32 */
  groupNumPerBroker: number
  /** @format int32 */
  groups: number
}

/** ChangeActiveAddress */
export interface ChangeActiveAddress {
  /** @format address */
  address: string
}

/** CompileContractResult */
export interface CompileContractResult {
  version: string
  name: string
  bytecode: string
  bytecodeDebugPatch: string
  /** @format 32-byte-hash */
  codeHash: string
  /** @format 32-byte-hash */
  codeHashDebug: string
  fields: FieldsSig
  functions: FunctionSig[]
  constants: Constant[]
  enums: Enum[]
  events: EventSig[]
  warnings: string[]
  maps?: MapsSig
  stdInterfaceId?: string
}

/** CompileProjectResult */
export interface CompileProjectResult {
  contracts: CompileContractResult[]
  scripts: CompileScriptResult[]
  structs?: StructSig[]
  constants?: Constant[]
  enums?: Enum[]
  warnings?: string[]
}

/** CompileScriptResult */
export interface CompileScriptResult {
  version: string
  name: string
  bytecodeTemplate: string
  bytecodeDebugPatch: string
  fields: FieldsSig
  functions: FunctionSig[]
  warnings: string[]
}

/** CompilerOptions */
export interface CompilerOptions {
  ignoreUnusedConstantsWarnings?: boolean
  ignoreUnusedVariablesWarnings?: boolean
  ignoreUnusedFieldsWarnings?: boolean
  ignoreUnusedPrivateFunctionsWarnings?: boolean
  ignoreUpdateFieldsCheckWarnings?: boolean
  ignoreCheckExternalCallerWarnings?: boolean
  ignoreUnusedFunctionReturnWarnings?: boolean
  skipAbstractContractCheck?: boolean
}

/** Confirmed */
export interface Confirmed {
  /** @format block-hash */
  blockHash: string
  /** @format int32 */
  txIndex: number
  /** @format int32 */
  chainConfirmations: number
  /** @format int32 */
  fromGroupConfirmations: number
  /** @format int32 */
  toGroupConfirmations: number
  type: string
}

/** Constant */
export interface Constant {
  name: string
  value: Val
}

/** Contract */
export interface Contract {
  code: string
  compilerOptions?: CompilerOptions
}

/** ContractEvent */
export interface ContractEvent {
  /** @format block-hash */
  blockHash: string
  /** @format 32-byte-hash */
  txId: string
  /** @format int32 */
  eventIndex: number
  fields: Val[]
}

/** ContractEventByBlockHash */
export interface ContractEventByBlockHash {
  /** @format 32-byte-hash */
  txId: string
  /** @format address */
  contractAddress: string
  /** @format int32 */
  eventIndex: number
  fields: Val[]
}

/** ContractEventByTxId */
export interface ContractEventByTxId {
  /** @format block-hash */
  blockHash: string
  /** @format address */
  contractAddress: string
  /** @format int32 */
  eventIndex: number
  fields: Val[]
}

/** ContractEvents */
export interface ContractEvents {
  events: ContractEvent[]
  /** @format int32 */
  nextStart: number
}

/** ContractEventsByBlockHash */
export interface ContractEventsByBlockHash {
  events: ContractEventByBlockHash[]
}

/** ContractEventsByTxId */
export interface ContractEventsByTxId {
  events: ContractEventByTxId[]
}

/** ContractOutput */
export interface ContractOutput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens: Token[]
  type: string
}

/** ContractState */
export interface ContractState {
  /** @format address */
  address: string
  /** @format contract */
  bytecode: string
  /** @format 32-byte-hash */
  codeHash: string
  /** @format 32-byte-hash */
  initialStateHash?: string
  immFields: Val[]
  mutFields: Val[]
  asset: AssetState
}

/** CurrentDifficulty */
export interface CurrentDifficulty {
  /** @format bigint */
  difficulty: string
}

/** DebugMessage */
export interface DebugMessage {
  /** @format address */
  contractAddress: string
  message: string
}

/** DecodeUnsignedTx */
export interface DecodeUnsignedTx {
  unsignedTx: string
}

/** DecodeUnsignedTxResult */
export interface DecodeUnsignedTxResult {
  /** @format int32 */
  fromGroup: number
  /** @format int32 */
  toGroup: number
  unsignedTx: UnsignedTx
}

/** Destination */
export interface Destination {
  /** @format address */
  address: string
  /** @format uint256 */
  attoAlphAmount: string
  tokens?: Token[]
  /** @format int64 */
  lockTime?: number
  /** @format hex-string */
  message?: string
}

/** DiscoveryAction */
export type DiscoveryAction = Reachable | Unreachable

/** Enum */
export interface Enum {
  name: string
  fields: EnumField[]
}

/** EnumField */
export interface EnumField {
  name: string
  value: Val
}

/** EventSig */
export interface EventSig {
  name: string
  fieldNames: string[]
  fieldTypes: string[]
}

/** FieldsSig */
export interface FieldsSig {
  names: string[]
  types: string[]
  isMutable: boolean[]
}

/** FixedAssetOutput */
export interface FixedAssetOutput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens: Token[]
  /** @format int64 */
  lockTime: number
  /** @format hex-string */
  message: string
}

/** FunctionSig */
export interface FunctionSig {
  name: string
  usePreapprovedAssets: boolean
  useAssetsInContract: boolean
  isPublic: boolean
  paramNames: string[]
  paramTypes: string[]
  paramIsMutable: boolean[]
  returnTypes: string[]
}

/** GhostUncleBlockEntry */
export interface GhostUncleBlockEntry {
  /** @format block-hash */
  blockHash: string
  /** @format address */
  miner: string
}

/** Group */
export interface Group {
  /** @format int32 */
  group: number
}

/** HashRateResponse */
export interface HashRateResponse {
  hashrate: string
}

/** HashesAtHeight */
export interface HashesAtHeight {
  headers: string[]
}

/** InterCliquePeerInfo */
export interface InterCliquePeerInfo {
  /** @format clique-id */
  cliqueId: string
  /** @format int32 */
  brokerId: number
  /** @format int32 */
  groupNumPerBroker: number
  /** @format inet-socket-address */
  address: {
    addr: string
    /** @format int32 */
    port: number
  }
  isSynced: boolean
  clientVersion: string
}

/** InternalServerError */
export interface InternalServerError {
  detail: string
}

/** MapsSig */
export interface MapsSig {
  names: string[]
  types: string[]
}

/** MemPooled */
export interface MemPooled {
  type: string
}

/** MempoolTransactions */
export interface MempoolTransactions {
  /** @format int32 */
  fromGroup: number
  /** @format int32 */
  toGroup: number
  transactions: TransactionTemplate[]
}

/** MinerAddresses */
export interface MinerAddresses {
  addresses: string[]
}

/** MinerAddressesInfo */
export interface MinerAddressesInfo {
  addresses: AddressInfo[]
}

/** MisbehaviorAction */
export type MisbehaviorAction = Ban | Unban

/** MultipleCallContract */
export interface MultipleCallContract {
  calls: CallContract[]
}

/** MultipleCallContractResult */
export interface MultipleCallContractResult {
  results: CallContractResult[]
}

/** NodeInfo */
export interface NodeInfo {
  buildInfo: BuildInfo
  upnp: boolean
  /** @format inet-socket-address */
  externalAddress?: {
    addr: string
    /** @format int32 */
    port: number
  }
}

/** NodeVersion */
export interface NodeVersion {
  /** @format semver */
  version: string
}

/** NotFound */
export interface NotFound {
  detail: string
  resource: string
}

/** Output */
export type Output = AssetOutput | ContractOutput

/** OutputRef */
export interface OutputRef {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
}

/** PeerAddress */
export interface PeerAddress {
  /** @format inet-address */
  address: string
  /** @format int32 */
  restPort: number
  /** @format int32 */
  wsPort: number
  /** @format int32 */
  minerApiPort: number
}

/** PeerMisbehavior */
export interface PeerMisbehavior {
  /** @format inet-address */
  peer: string
  status: PeerStatus
}

/** PeerStatus */
export type PeerStatus = Banned | Penalty

/** Penalty */
export interface Penalty {
  /** @format int32 */
  value: number
  type: string
}

/** Project */
export interface Project {
  code: string
  compilerOptions?: CompilerOptions
}

/** RawBlock */
export interface RawBlock {
  /** @format hex-string */
  value: string
}

/** RawTransaction */
export interface RawTransaction {
  /** @format hex-string */
  value: string
}

/** Reachable */
export interface Reachable {
  peers: string[]
  type: string
}

/** Result */
export interface Result {
  /** @format bigint */
  hashrate: string
}

/** RevealMnemonic */
export interface RevealMnemonic {
  password: string
}

/** RevealMnemonicResult */
export interface RevealMnemonicResult {
  mnemonic: string
}

/** RichAssetInput */
export interface RichAssetInput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format hex-string */
  unlockScript: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens: Token[]
}

/** RichBlockAndEvents */
export interface RichBlockAndEvents {
  block: RichBlockEntry
  events: ContractEventByBlockHash[]
}

/** RichBlockEntry */
export interface RichBlockEntry {
  /** @format block-hash */
  hash: string
  /** @format int64 */
  timestamp: number
  /** @format int32 */
  chainFrom: number
  /** @format int32 */
  chainTo: number
  /** @format int32 */
  height: number
  deps: string[]
  transactions: RichTransaction[]
  /** @format hex-string */
  nonce: string
  version: number
  /** @format 32-byte-hash */
  depStateHash: string
  /** @format 32-byte-hash */
  txsHash: string
  /** @format hex-string */
  target: string
  ghostUncles: GhostUncleBlockEntry[]
}

/** RichBlocksAndEventsPerTimeStampRange */
export interface RichBlocksAndEventsPerTimeStampRange {
  blocksAndEvents: RichBlockAndEvents[][]
}

/** RichContractInput */
export interface RichContractInput {
  /** @format int32 */
  hint: number
  /** @format 32-byte-hash */
  key: string
  /** @format uint256 */
  attoAlphAmount: string
  /** @format address */
  address: string
  tokens: Token[]
}

/** RichTransaction */
export interface RichTransaction {
  unsigned: RichUnsignedTx
  scriptExecutionOk: boolean
  contractInputs: RichContractInput[]
  generatedOutputs: Output[]
  inputSignatures: string[]
  scriptSignatures: string[]
}

/** RichUnsignedTx */
export interface RichUnsignedTx {
  /** @format 32-byte-hash */
  txId: string
  version: number
  networkId: number
  /** @format script */
  scriptOpt?: string
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  inputs: RichAssetInput[]
  fixedOutputs: FixedAssetOutput[]
}

/** Script */
export interface Script {
  code: string
  compilerOptions?: CompilerOptions
}

/** SelfClique */
export interface SelfClique {
  /** @format clique-id */
  cliqueId: string
  nodes: PeerAddress[]
  selfReady: boolean
  synced: boolean
}

/** ServiceUnavailable */
export interface ServiceUnavailable {
  detail: string
}

/** Sign */
export interface Sign {
  /** @format 32-byte-hash */
  data: string
}

/** SignResult */
export interface SignResult {
  /** @format signature */
  signature: string
}

/** Source */
export interface Source {
  /** @format hex-string */
  fromPublicKey: string
  destinations: Destination[]
  /** @format hex-string */
  fromPublicKeyType?: string
  /** @format gas */
  gasAmount?: number
  utxos?: OutputRef[]
}

/** StructSig */
export interface StructSig {
  name: string
  fieldNames: string[]
  fieldTypes: string[]
  isMutable: boolean[]
}

/** SubContracts */
export interface SubContracts {
  subContracts: string[]
  /** @format int32 */
  nextStart: number
}

/** SubmitMultisig */
export interface SubmitMultisig {
  unsignedTx: string
  signatures: string[]
}

/** SubmitTransaction */
export interface SubmitTransaction {
  unsignedTx: string
  /** @format signature */
  signature: string
}

/** SubmitTxResult */
export interface SubmitTxResult {
  /** @format 32-byte-hash */
  txId: string
  /** @format int32 */
  fromGroup: number
  /** @format int32 */
  toGroup: number
}

/** Sweep */
export interface Sweep {
  /** @format address */
  toAddress: string
  /** @format int64 */
  lockTime?: number
  /** @format gas */
  gasAmount?: number
  /** @format uint256 */
  gasPrice?: string
  /** @format int32 */
  utxosLimit?: number
  /** @format block-hash */
  targetBlockHash?: string
}

/** SweepAddressTransaction */
export interface SweepAddressTransaction {
  /** @format 32-byte-hash */
  txId: string
  unsignedTx: string
  /** @format gas */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
}

/** TargetToHashrate */
export interface TargetToHashrate {
  /** @format hex-string */
  target: string
}

/** TestContract */
export interface TestContract {
  /** @format int32 */
  group?: number
  /** @format block-hash */
  blockHash?: string
  /** @format int64 */
  blockTimeStamp?: number
  /** @format 32-byte-hash */
  txId?: string
  /** @format address */
  address?: string
  /** @format address */
  callerAddress?: string
  /** @format contract */
  bytecode: string
  initialImmFields?: Val[]
  initialMutFields?: Val[]
  initialAsset?: AssetState
  /** @format int32 */
  methodIndex?: number
  args?: Val[]
  existingContracts?: ContractState[]
  inputAssets?: TestInputAsset[]
}

/** TestContractResult */
export interface TestContractResult {
  /** @format address */
  address: string
  /** @format 32-byte-hash */
  codeHash: string
  returns: Val[]
  /** @format int32 */
  gasUsed: number
  contracts: ContractState[]
  txInputs: string[]
  txOutputs: Output[]
  events: ContractEventByTxId[]
  debugMessages: DebugMessage[]
}

/** TestInputAsset */
export interface TestInputAsset {
  /** @format address */
  address: string
  asset: AssetState
}

/** Token */
export interface Token {
  /** @format 32-byte-hash */
  id: string
  /** @format uint256 */
  amount: string
}

/** Transaction */
export interface Transaction {
  unsigned: UnsignedTx
  scriptExecutionOk: boolean
  contractInputs: OutputRef[]
  generatedOutputs: Output[]
  inputSignatures: string[]
  scriptSignatures: string[]
}

/** TransactionTemplate */
export interface TransactionTemplate {
  unsigned: UnsignedTx
  inputSignatures: string[]
  scriptSignatures: string[]
  /** @format int64 */
  seenAt: number
}

/** Transfer */
export interface Transfer {
  destinations: Destination[]
  /** @format gas */
  gas?: number
  /** @format uint256 */
  gasPrice?: string
  /** @format int32 */
  utxosLimit?: number
}

/** TransferResult */
export interface TransferResult {
  /** @format 32-byte-hash */
  txId: string
  /** @format group-index */
  fromGroup: number
  /** @format group-index */
  toGroup: number
}

/** TransferResults */
export interface TransferResults {
  results: TransferResult[]
}

/** TxNotFound */
export interface TxNotFound {
  type: string
}

/** TxStatus */
export type TxStatus = Confirmed | MemPooled | TxNotFound

/** UTXO */
export interface UTXO {
  ref: OutputRef
  /** @format uint256 */
  amount: string
  tokens?: Token[]
  /** @format int64 */
  lockTime?: number
  /** @format hex-string */
  additionalData?: string
}

/** UTXOs */
export interface UTXOs {
  utxos: UTXO[]
}

/** Unauthorized */
export interface Unauthorized {
  detail: string
}

/** Unban */
export interface Unban {
  peers: string[]
  type: string
}

/** Unreachable */
export interface Unreachable {
  peers: string[]
  type: string
}

/** UnsignedTx */
export interface UnsignedTx {
  /** @format 32-byte-hash */
  txId: string
  version: number
  networkId: number
  /** @format script */
  scriptOpt?: string
  /** @format int32 */
  gasAmount: number
  /** @format uint256 */
  gasPrice: string
  inputs: AssetInput[]
  fixedOutputs: FixedAssetOutput[]
}

/** Val */
export type Val = ValAddress | ValArray | ValBool | ValByteVec | ValI256 | ValU256

/** ValAddress */
export interface ValAddress {
  /** @format address */
  value: string
  type: string
}

/** ValArray */
export interface ValArray {
  value: Val[]
  type: string
}

/** ValBool */
export interface ValBool {
  value: boolean
  type: string
}

/** ValByteVec */
export interface ValByteVec {
  /** @format hex-string */
  value: string
  type: string
}

/** ValI256 */
export interface ValI256 {
  /** @format bigint */
  value: string
  type: string
}

/** ValU256 */
export interface ValU256 {
  /** @format uint256 */
  value: string
  type: string
}

/** VerifySignature */
export interface VerifySignature {
  /** @format hex-string */
  data: string
  /** @format signature */
  signature: string
  /** @format public-key */
  publicKey: string
}

/** WalletCreation */
export interface WalletCreation {
  password: string
  walletName: string
  isMiner?: boolean
  mnemonicPassphrase?: string
  mnemonicSize?: number
}

/** WalletCreationResult */
export interface WalletCreationResult {
  walletName: string
  mnemonic: string
}

/** WalletRestore */
export interface WalletRestore {
  password: string
  mnemonic: string
  walletName: string
  isMiner?: boolean
  mnemonicPassphrase?: string
}

/** WalletRestoreResult */
export interface WalletRestoreResult {
  walletName: string
}

/** WalletStatus */
export interface WalletStatus {
  walletName: string
  locked: boolean
}

/** WalletUnlock */
export interface WalletUnlock {
  password: string
  mnemonicPassphrase?: string
}

import 'cross-fetch/polyfill'
import { convertHttpResponse } from './utils'

export type QueryParamsType = Record<string | number, any>
export type ResponseFormat = keyof Omit<Body, 'body' | 'bodyUsed'>

export interface FullRequestParams extends Omit<RequestInit, 'body'> {
  /** set parameter to `true` for call `securityWorker` for this request */
  secure?: boolean
  /** request path */
  path: string
  /** content type of request body */
  type?: ContentType
  /** query params */
  query?: QueryParamsType
  /** format of response (i.e. response.json() -> format: "json") */
  format?: ResponseFormat
  /** request body */
  body?: unknown
  /** base url */
  baseUrl?: string
  /** request cancellation token */
  cancelToken?: CancelToken
}

export type RequestParams = Omit<FullRequestParams, 'body' | 'method' | 'query' | 'path'>

export interface ApiConfig<SecurityDataType = unknown> {
  baseUrl?: string
  baseApiParams?: Omit<RequestParams, 'baseUrl' | 'cancelToken' | 'signal'>
  securityWorker?: (securityData: SecurityDataType | null) => Promise<RequestParams | void> | RequestParams | void
  customFetch?: typeof fetch
}

export interface HttpResponse<D extends unknown, E extends unknown = unknown> extends Response {
  data: D
  error: E
}

type CancelToken = Symbol | string | number

export enum ContentType {
  Json = 'application/json',
  FormData = 'multipart/form-data',
  UrlEncoded = 'application/x-www-form-urlencoded',
  Text = 'text/plain'
}

export class HttpClient<SecurityDataType = unknown> {
  public baseUrl: string = '../'
  private securityData: SecurityDataType | null = null
  private securityWorker?: ApiConfig<SecurityDataType>['securityWorker']
  private abortControllers = new Map<CancelToken, AbortController>()
  private customFetch = (...fetchParams: Parameters<typeof fetch>) => fetch(...fetchParams)

  private baseApiParams: RequestParams = {
    credentials: 'same-origin',
    headers: {},
    redirect: 'follow',
    referrerPolicy: 'no-referrer'
  }

  constructor(apiConfig: ApiConfig<SecurityDataType> = {}) {
    Object.assign(this, apiConfig)
  }

  public setSecurityData = (data: SecurityDataType | null) => {
    this.securityData = data
  }

  protected encodeQueryParam(key: string, value: any) {
    const encodedKey = encodeURIComponent(key)
    return `${encodedKey}=${encodeURIComponent(typeof value === 'number' ? value : `${value}`)}`
  }

  protected addQueryParam(query: QueryParamsType, key: string) {
    return this.encodeQueryParam(key, query[key])
  }

  protected addArrayQueryParam(query: QueryParamsType, key: string) {
    const value = query[key]
    return value.map((v: any) => this.encodeQueryParam(key, v)).join('&')
  }

  protected toQueryString(rawQuery?: QueryParamsType): string {
    const query = rawQuery || {}
    const keys = Object.keys(query).filter((key) => 'undefined' !== typeof query[key])
    return keys
      .map((key) => (Array.isArray(query[key]) ? this.addArrayQueryParam(query, key) : this.addQueryParam(query, key)))
      .join('&')
  }

  protected addQueryParams(rawQuery?: QueryParamsType): string {
    const queryString = this.toQueryString(rawQuery)
    return queryString ? `?${queryString}` : ''
  }

  private contentFormatters: Record<ContentType, (input: any) => any> = {
    [ContentType.Json]: (input: any) =>
      input !== null && (typeof input === 'object' || typeof input === 'string') ? JSON.stringify(input) : input,
    [ContentType.Text]: (input: any) => (input !== null && typeof input !== 'string' ? JSON.stringify(input) : input),
    [ContentType.FormData]: (input: any) =>
      Object.keys(input || {}).reduce((formData, key) => {
        const property = input[key]
        formData.append(
          key,
          property instanceof Blob
            ? property
            : typeof property === 'object' && property !== null
            ? JSON.stringify(property)
            : `${property}`
        )
        return formData
      }, new FormData()),
    [ContentType.UrlEncoded]: (input: any) => this.toQueryString(input)
  }

  protected mergeRequestParams(params1: RequestParams, params2?: RequestParams): RequestParams {
    return {
      ...this.baseApiParams,
      ...params1,
      ...(params2 || {}),
      headers: {
        ...(this.baseApiParams.headers || {}),
        ...(params1.headers || {}),
        ...((params2 && params2.headers) || {})
      }
    }
  }

  protected createAbortSignal = (cancelToken: CancelToken): AbortSignal | undefined => {
    if (this.abortControllers.has(cancelToken)) {
      const abortController = this.abortControllers.get(cancelToken)
      if (abortController) {
        return abortController.signal
      }
      return void 0
    }

    const abortController = new AbortController()
    this.abortControllers.set(cancelToken, abortController)
    return abortController.signal
  }

  public abortRequest = (cancelToken: CancelToken) => {
    const abortController = this.abortControllers.get(cancelToken)

    if (abortController) {
      abortController.abort()
      this.abortControllers.delete(cancelToken)
    }
  }

  public request = async <T = any, E = any>({
    body,
    secure,
    path,
    type,
    query,
    format,
    baseUrl,
    cancelToken,
    ...params
  }: FullRequestParams): Promise<HttpResponse<T, E>> => {
    const secureParams =
      ((typeof secure === 'boolean' ? secure : this.baseApiParams.secure) &&
        this.securityWorker &&
        (await this.securityWorker(this.securityData))) ||
      {}
    const requestParams = this.mergeRequestParams(params, secureParams)
    const queryString = query && this.toQueryString(query)
    const payloadFormatter = this.contentFormatters[type || ContentType.Json]
    const responseFormat = format || requestParams.format

    return this.customFetch(`${baseUrl || this.baseUrl || ''}${path}${queryString ? `?${queryString}` : ''}`, {
      ...requestParams,
      headers: {
        ...(requestParams.headers || {}),
        ...(type && type !== ContentType.FormData ? { 'Content-Type': type } : {})
      },
      signal: cancelToken ? this.createAbortSignal(cancelToken) : requestParams.signal,
      body: typeof body === 'undefined' || body === null ? null : payloadFormatter(body)
    }).then(async (response) => {
      const r = response as HttpResponse<T, E>
      r.data = null as unknown as T
      r.error = null as unknown as E

      const data = !responseFormat
        ? r
        : await response[responseFormat]()
            .then((data) => {
              if (r.ok) {
                r.data = data
              } else {
                r.error = data
              }
              return r
            })
            .catch((e) => {
              r.error = e
              return r
            })

      if (cancelToken) {
        this.abortControllers.delete(cancelToken)
      }

      return data
    })
  }
}

/**
 * @title Alephium API
 * @version 3.10.0
 * @baseUrl ../
 */
export class Api<SecurityDataType extends unknown> extends HttpClient<SecurityDataType> {
  wallets = {
    /**
     * No description
     *
     * @tags Wallets
     * @name GetWallets
     * @summary List available wallets
     * @request GET:/wallets
     */
    getWallets: (params: RequestParams = {}) =>
      this.request<WalletStatus[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PutWallets
     * @summary Restore a wallet from your mnemonic
     * @request PUT:/wallets
     */
    putWallets: (data: WalletRestore, params: RequestParams = {}) =>
      this.request<
        WalletRestoreResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/wallets`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description A new wallet will be created and respond with a mnemonic. Make sure to keep that mnemonic safely as it will allows you to recover your wallet. Default mnemonic size is 24, (options: 12, 15, 18, 21, 24).
     *
     * @tags Wallets
     * @name PostWallets
     * @summary Create a new wallet
     * @request POST:/wallets
     */
    postWallets: (data: WalletCreation, params: RequestParams = {}) =>
      this.request<
        WalletCreationResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/wallets`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletName
     * @summary Get wallet's status
     * @request GET:/wallets/{wallet_name}
     */
    getWalletsWalletName: (walletName: string, params: RequestParams = {}) =>
      this.request<WalletStatus, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name DeleteWalletsWalletName
     * @summary Delete your wallet file (can be recovered with your mnemonic)
     * @request DELETE:/wallets/{wallet_name}
     */
    deleteWalletsWalletName: (
      walletName: string,
      query: {
        password: string
      },
      params: RequestParams = {}
    ) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}`,
        method: 'DELETE',
        query: query,
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameLock
     * @summary Lock your wallet
     * @request POST:/wallets/{wallet_name}/lock
     */
    postWalletsWalletNameLock: (walletName: string, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/lock`,
        method: 'POST',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameUnlock
     * @summary Unlock your wallet
     * @request POST:/wallets/{wallet_name}/unlock
     */
    postWalletsWalletNameUnlock: (walletName: string, data: WalletUnlock, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/unlock`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletNameBalances
     * @summary Get your total balance
     * @request GET:/wallets/{wallet_name}/balances
     */
    getWalletsWalletNameBalances: (walletName: string, params: RequestParams = {}) =>
      this.request<Balances, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/balances`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameRevealMnemonic
     * @summary Reveal your mnemonic. !!! use it with caution !!!
     * @request POST:/wallets/{wallet_name}/reveal-mnemonic
     */
    postWalletsWalletNameRevealMnemonic: (walletName: string, data: RevealMnemonic, params: RequestParams = {}) =>
      this.request<
        RevealMnemonicResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/wallets/${walletName}/reveal-mnemonic`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameTransfer
     * @summary Transfer ALPH from the active address
     * @request POST:/wallets/{wallet_name}/transfer
     */
    postWalletsWalletNameTransfer: (walletName: string, data: Transfer, params: RequestParams = {}) =>
      this.request<TransferResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/transfer`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameSweepActiveAddress
     * @summary Transfer all unlocked ALPH from the active address to another address
     * @request POST:/wallets/{wallet_name}/sweep-active-address
     */
    postWalletsWalletNameSweepActiveAddress: (walletName: string, data: Sweep, params: RequestParams = {}) =>
      this.request<TransferResults, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/sweep-active-address`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameSweepAllAddresses
     * @summary Transfer unlocked ALPH from all addresses (including all mining addresses if applicable) to another address
     * @request POST:/wallets/{wallet_name}/sweep-all-addresses
     */
    postWalletsWalletNameSweepAllAddresses: (walletName: string, data: Sweep, params: RequestParams = {}) =>
      this.request<TransferResults, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/sweep-all-addresses`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameSign
     * @summary Sign the given data and return back the signature
     * @request POST:/wallets/{wallet_name}/sign
     */
    postWalletsWalletNameSign: (walletName: string, data: Sign, params: RequestParams = {}) =>
      this.request<SignResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/sign`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletNameAddresses
     * @summary List all your wallet's addresses
     * @request GET:/wallets/{wallet_name}/addresses
     */
    getWalletsWalletNameAddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<Addresses, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/addresses`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name GetWalletsWalletNameAddressesAddress
     * @summary Get address' info
     * @request GET:/wallets/{wallet_name}/addresses/{address}
     */
    getWalletsWalletNameAddressesAddress: (walletName: string, address: string, params: RequestParams = {}) =>
      this.request<AddressInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/addresses/${address}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description This endpoint can only be called if the wallet was created with the `isMiner = true` flag
     *
     * @tags Miners
     * @name GetWalletsWalletNameMinerAddresses
     * @summary List all miner addresses per group
     * @request GET:/wallets/{wallet_name}/miner-addresses
     */
    getWalletsWalletNameMinerAddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<
        MinerAddressesInfo[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/wallets/${walletName}/miner-addresses`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Cannot be called from a miner wallet
     *
     * @tags Wallets
     * @name PostWalletsWalletNameDeriveNextAddress
     * @summary Derive your next address
     * @request POST:/wallets/{wallet_name}/derive-next-address
     */
    postWalletsWalletNameDeriveNextAddress: (
      walletName: string,
      query?: {
        /** @format int32 */
        group?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<AddressInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/derive-next-address`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * @description Your wallet need to have been created with the miner flag set to true
     *
     * @tags Miners
     * @name PostWalletsWalletNameDeriveNextMinerAddresses
     * @summary Derive your next miner addresses for each group
     * @request POST:/wallets/{wallet_name}/derive-next-miner-addresses
     */
    postWalletsWalletNameDeriveNextMinerAddresses: (walletName: string, params: RequestParams = {}) =>
      this.request<AddressInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/derive-next-miner-addresses`,
        method: 'POST',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Wallets
     * @name PostWalletsWalletNameChangeActiveAddress
     * @summary Choose the active address
     * @request POST:/wallets/{wallet_name}/change-active-address
     */
    postWalletsWalletNameChangeActiveAddress: (
      walletName: string,
      data: ChangeActiveAddress,
      params: RequestParams = {}
    ) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/wallets/${walletName}/change-active-address`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params
      }).then(convertHttpResponse)
  }
  infos = {
    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosNode
     * @summary Get info about that node
     * @request GET:/infos/node
     */
    getInfosNode: (params: RequestParams = {}) =>
      this.request<NodeInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/node`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosVersion
     * @summary Get version about that node
     * @request GET:/infos/version
     */
    getInfosVersion: (params: RequestParams = {}) =>
      this.request<NodeVersion, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/version`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosChainParams
     * @summary Get key params about your blockchain
     * @request GET:/infos/chain-params
     */
    getInfosChainParams: (params: RequestParams = {}) =>
      this.request<ChainParams, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/chain-params`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosSelfClique
     * @summary Get info about your own clique
     * @request GET:/infos/self-clique
     */
    getInfosSelfClique: (params: RequestParams = {}) =>
      this.request<SelfClique, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/self-clique`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosInterCliquePeerInfo
     * @summary Get infos about the inter cliques
     * @request GET:/infos/inter-clique-peer-info
     */
    getInfosInterCliquePeerInfo: (params: RequestParams = {}) =>
      this.request<
        InterCliquePeerInfo[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/infos/inter-clique-peer-info`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosDiscoveredNeighbors
     * @summary Get discovered neighbors
     * @request GET:/infos/discovered-neighbors
     */
    getInfosDiscoveredNeighbors: (params: RequestParams = {}) =>
      this.request<BrokerInfo[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/discovered-neighbors`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosMisbehaviors
     * @summary Get the misbehaviors of peers
     * @request GET:/infos/misbehaviors
     */
    getInfosMisbehaviors: (params: RequestParams = {}) =>
      this.request<PeerMisbehavior[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/misbehaviors`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name PostInfosMisbehaviors
     * @summary Ban/Unban given peers
     * @request POST:/infos/misbehaviors
     */
    postInfosMisbehaviors: (data: MisbehaviorAction, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/misbehaviors`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosUnreachable
     * @summary Get the unreachable brokers
     * @request GET:/infos/unreachable
     */
    getInfosUnreachable: (params: RequestParams = {}) =>
      this.request<string[], BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/unreachable`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name PostInfosDiscovery
     * @summary Set brokers to be unreachable/reachable
     * @request POST:/infos/discovery
     */
    postInfosDiscovery: (data: DiscoveryAction, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/discovery`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosHistoryHashrate
     * @summary Get history average hashrate on the given time interval
     * @request GET:/infos/history-hashrate
     */
    getInfosHistoryHashrate: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<HashRateResponse, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/history-hashrate`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosCurrentHashrate
     * @summary Get average hashrate from `now - timespan(millis)` to `now`
     * @request GET:/infos/current-hashrate
     */
    getInfosCurrentHashrate: (
      query?: {
        /**
         * @format int64
         * @min 1
         */
        timespan?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<HashRateResponse, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/current-hashrate`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Infos
     * @name GetInfosCurrentDifficulty
     * @summary Get the average difficulty of the latest blocks from all shards
     * @request GET:/infos/current-difficulty
     */
    getInfosCurrentDifficulty: (params: RequestParams = {}) =>
      this.request<CurrentDifficulty, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/infos/current-difficulty`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  blockflow = {
    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowBlocks
     * @summary List blocks on the given time interval
     * @request GET:/blockflow/blocks
     */
    getBlockflowBlocks: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<
        BlocksPerTimeStampRange,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/blockflow/blocks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowBlocksWithEvents
     * @summary List blocks with events on the given time interval
     * @request GET:/blockflow/blocks-with-events
     */
    getBlockflowBlocksWithEvents: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<
        BlocksAndEventsPerTimeStampRange,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/blockflow/blocks-with-events`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowRichBlocks
     * @summary Given a time interval, list blocks containing events and transactions with enriched input information when node indexes are enabled.
     * @request GET:/blockflow/rich-blocks
     */
    getBlockflowRichBlocks: (
      query: {
        /**
         * @format int64
         * @min 0
         */
        fromTs: number
        /**
         * @format int64
         * @min 0
         */
        toTs?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<
        RichBlocksAndEventsPerTimeStampRange,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/blockflow/rich-blocks`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowBlocksBlockHash
     * @summary Get a block with hash
     * @request GET:/blockflow/blocks/{block_hash}
     */
    getBlockflowBlocksBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<BlockEntry, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/blocks/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowMainChainBlockByGhostUncleGhostUncleHash
     * @summary Get a mainchain block by ghost uncle hash
     * @request GET:/blockflow/main-chain-block-by-ghost-uncle/{ghost_uncle_hash}
     */
    getBlockflowMainChainBlockByGhostUncleGhostUncleHash: (ghostUncleHash: string, params: RequestParams = {}) =>
      this.request<BlockEntry, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/main-chain-block-by-ghost-uncle/${ghostUncleHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowBlocksWithEventsBlockHash
     * @summary Get a block and events with hash
     * @request GET:/blockflow/blocks-with-events/{block_hash}
     */
    getBlockflowBlocksWithEventsBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<BlockAndEvents, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/blocks-with-events/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowRichBlocksBlockHash
     * @summary Get a block containing events and transactions with enriched input information when node indexes are enabled.
     * @request GET:/blockflow/rich-blocks/{block_hash}
     */
    getBlockflowRichBlocksBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<RichBlockAndEvents, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>(
        {
          path: `/blockflow/rich-blocks/${blockHash}`,
          method: 'GET',
          format: 'json',
          ...params
        }
      ).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowIsBlockInMainChain
     * @summary Check if the block is in main chain
     * @request GET:/blockflow/is-block-in-main-chain
     */
    getBlockflowIsBlockInMainChain: (
      query: {
        /** @format block-hash */
        blockHash: string
      },
      params: RequestParams = {}
    ) =>
      this.request<boolean, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/is-block-in-main-chain`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowHashes
     * @summary Get all block's hashes at given height for given groups
     * @request GET:/blockflow/hashes
     */
    getBlockflowHashes: (
      query: {
        /** @format int32 */
        fromGroup: number
        /** @format int32 */
        toGroup: number
        /** @format int32 */
        height: number
      },
      params: RequestParams = {}
    ) =>
      this.request<HashesAtHeight, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/hashes`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowChainInfo
     * @summary Get infos about the chain from the given groups
     * @request GET:/blockflow/chain-info
     */
    getBlockflowChainInfo: (
      query: {
        /** @format int32 */
        fromGroup: number
        /** @format int32 */
        toGroup: number
      },
      params: RequestParams = {}
    ) =>
      this.request<ChainInfo, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/chain-info`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowHeadersBlockHash
     * @summary Get block header
     * @request GET:/blockflow/headers/{block_hash}
     */
    getBlockflowHeadersBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<BlockHeaderEntry, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/headers/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Blockflow
     * @name GetBlockflowRawBlocksBlockHash
     * @summary Get raw block in hex format
     * @request GET:/blockflow/raw-blocks/{block_hash}
     */
    getBlockflowRawBlocksBlockHash: (blockHash: string, params: RequestParams = {}) =>
      this.request<RawBlock, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/blockflow/raw-blocks/${blockHash}`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  addresses = {
    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressBalance
     * @summary Get the balance of an address
     * @request GET:/addresses/{address}/balance
     */
    getAddressesAddressBalance: (
      address: string,
      query?: {
        mempool?: boolean
      },
      params: RequestParams = {}
    ) =>
      this.request<Balance, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/balance`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressUtxos
     * @summary Get the UTXOs of an address
     * @request GET:/addresses/{address}/utxos
     */
    getAddressesAddressUtxos: (address: string, params: RequestParams = {}) =>
      this.request<UTXOs, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/utxos`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Addresses
     * @name GetAddressesAddressGroup
     * @summary Get the group of an address
     * @request GET:/addresses/{address}/group
     */
    getAddressesAddressGroup: (address: string, params: RequestParams = {}) =>
      this.request<Group, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/addresses/${address}/group`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  transactions = {
    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsBuild
     * @summary Build an unsigned transfer transaction to a number of recipients
     * @request POST:/transactions/build
     */
    postTransactionsBuild: (data: BuildTransferTx, params: RequestParams = {}) =>
      this.request<
        BuildTransferTxResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/build`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsBuildTransferFromOneToManyGroups
     * @summary Build unsigned transfer transactions from an address of one group to addresses of many groups. Each target group requires a dedicated transaction or more in case large number of outputs needed to be split.
     * @request POST:/transactions/build-transfer-from-one-to-many-groups
     */
    postTransactionsBuildTransferFromOneToManyGroups: (data: BuildTransferTx, params: RequestParams = {}) =>
      this.request<
        BuildTransferTxResult[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/build-transfer-from-one-to-many-groups`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsBuildMultiAddresses
     * @summary Build an unsigned transaction with multiple addresses to a number of recipients
     * @request POST:/transactions/build-multi-addresses
     */
    postTransactionsBuildMultiAddresses: (data: BuildMultiAddressesTransaction, params: RequestParams = {}) =>
      this.request<
        BuildTransferTxResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/build-multi-addresses`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsSweepAddressBuild
     * @summary Build unsigned transactions to send all unlocked ALPH and token balances of one address to another address
     * @request POST:/transactions/sweep-address/build
     */
    postTransactionsSweepAddressBuild: (data: BuildSweepAddressTransactions, params: RequestParams = {}) =>
      this.request<
        BuildSweepAddressTransactionsResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/sweep-address/build`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsSubmit
     * @summary Submit a signed transaction
     * @request POST:/transactions/submit
     */
    postTransactionsSubmit: (data: SubmitTransaction, params: RequestParams = {}) =>
      this.request<SubmitTxResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/submit`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsDecodeUnsignedTx
     * @summary Decode an unsigned transaction
     * @request POST:/transactions/decode-unsigned-tx
     */
    postTransactionsDecodeUnsignedTx: (data: DecodeUnsignedTx, params: RequestParams = {}) =>
      this.request<
        DecodeUnsignedTxResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/decode-unsigned-tx`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsDetailsTxid
     * @summary Get transaction details
     * @request GET:/transactions/details/{txId}
     */
    getTransactionsDetailsTxid: (
      txId: string,
      query?: {
        /** @format int32 */
        fromGroup?: number
        /** @format int32 */
        toGroup?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<Transaction, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/details/${txId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsRichDetailsTxid
     * @summary Get transaction with enriched input information when node indexes are enabled.
     * @request GET:/transactions/rich-details/{txId}
     */
    getTransactionsRichDetailsTxid: (
      txId: string,
      query?: {
        /** @format int32 */
        fromGroup?: number
        /** @format int32 */
        toGroup?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<RichTransaction, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/rich-details/${txId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsRawTxid
     * @summary Get raw transaction in hex format
     * @request GET:/transactions/raw/{txId}
     */
    getTransactionsRawTxid: (
      txId: string,
      query?: {
        /** @format int32 */
        fromGroup?: number
        /** @format int32 */
        toGroup?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<RawTransaction, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/raw/${txId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsStatus
     * @summary Get tx status
     * @request GET:/transactions/status
     */
    getTransactionsStatus: (
      query: {
        /** @format 32-byte-hash */
        txId: string
        /** @format int32 */
        fromGroup?: number
        /** @format int32 */
        toGroup?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<TxStatus, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/status`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name GetTransactionsTxIdFromOutputref
     * @summary Get transaction id from transaction output ref
     * @request GET:/transactions/tx-id-from-outputref
     */
    getTransactionsTxIdFromOutputref: (
      query: {
        /** @format int32 */
        hint: number
        /** @format 32-byte-hash */
        key: string
      },
      params: RequestParams = {}
    ) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/transactions/tx-id-from-outputref`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Transactions
     * @name PostTransactionsBuildChained
     * @summary Build a chain of transactions
     * @request POST:/transactions/build-chained
     */
    postTransactionsBuildChained: (data: BuildChainedTx[], params: RequestParams = {}) =>
      this.request<
        BuildChainedTxResult[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/transactions/build-chained`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  mempool = {
    /**
     * No description
     *
     * @tags Mempool
     * @name GetMempoolTransactions
     * @summary List mempool transactions
     * @request GET:/mempool/transactions
     */
    getMempoolTransactions: (params: RequestParams = {}) =>
      this.request<
        MempoolTransactions[],
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/mempool/transactions`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Mempool
     * @name DeleteMempoolTransactions
     * @summary Remove all transactions from mempool
     * @request DELETE:/mempool/transactions
     */
    deleteMempoolTransactions: (params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/mempool/transactions`,
        method: 'DELETE',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Mempool
     * @name PutMempoolTransactionsRebroadcast
     * @summary Rebroadcase a mempool transaction to the network
     * @request PUT:/mempool/transactions/rebroadcast
     */
    putMempoolTransactionsRebroadcast: (
      query: {
        /** @format 32-byte-hash */
        txId: string
      },
      params: RequestParams = {}
    ) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/mempool/transactions/rebroadcast`,
        method: 'PUT',
        query: query,
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Mempool
     * @name PutMempoolTransactionsValidate
     * @summary Validate all mempool transactions and remove invalid ones
     * @request PUT:/mempool/transactions/validate
     */
    putMempoolTransactionsValidate: (params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/mempool/transactions/validate`,
        method: 'PUT',
        ...params
      }).then(convertHttpResponse)
  }
  contracts = {
    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsCompileScript
     * @summary Compile a script
     * @request POST:/contracts/compile-script
     */
    postContractsCompileScript: (data: Script, params: RequestParams = {}) =>
      this.request<
        CompileScriptResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/compile-script`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsUnsignedTxExecuteScript
     * @summary Build an unsigned script
     * @request POST:/contracts/unsigned-tx/execute-script
     */
    postContractsUnsignedTxExecuteScript: (data: BuildExecuteScriptTx, params: RequestParams = {}) =>
      this.request<
        BuildExecuteScriptTxResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/unsigned-tx/execute-script`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsCompileContract
     * @summary Compile a smart contract
     * @request POST:/contracts/compile-contract
     */
    postContractsCompileContract: (data: Contract, params: RequestParams = {}) =>
      this.request<
        CompileContractResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/compile-contract`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsCompileProject
     * @summary Compile a project
     * @request POST:/contracts/compile-project
     */
    postContractsCompileProject: (data: Project, params: RequestParams = {}) =>
      this.request<
        CompileProjectResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/compile-project`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsUnsignedTxDeployContract
     * @summary Build an unsigned contract
     * @request POST:/contracts/unsigned-tx/deploy-contract
     */
    postContractsUnsignedTxDeployContract: (data: BuildDeployContractTx, params: RequestParams = {}) =>
      this.request<
        BuildDeployContractTxResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/unsigned-tx/deploy-contract`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsAddressState
     * @summary Get contract state
     * @request GET:/contracts/{address}/state
     */
    getContractsAddressState: (address: string, params: RequestParams = {}) =>
      this.request<ContractState, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${address}/state`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsCodehashCode
     * @summary Get contract code by code hash
     * @request GET:/contracts/{codeHash}/code
     */
    getContractsCodehashCode: (codeHash: string, params: RequestParams = {}) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${codeHash}/code`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsTestContract
     * @summary Test contract
     * @request POST:/contracts/test-contract
     */
    postContractsTestContract: (data: TestContract, params: RequestParams = {}) =>
      this.request<TestContractResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>(
        {
          path: `/contracts/test-contract`,
          method: 'POST',
          body: data,
          type: ContentType.Json,
          format: 'json',
          ...params
        }
      ).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsCallContract
     * @summary Call contract
     * @request POST:/contracts/call-contract
     */
    postContractsCallContract: (data: CallContract, params: RequestParams = {}) =>
      this.request<CallContractResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>(
        {
          path: `/contracts/call-contract`,
          method: 'POST',
          body: data,
          type: ContentType.Json,
          format: 'json',
          ...params
        }
      ).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsMulticallContract
     * @summary Multiple call contract
     * @request POST:/contracts/multicall-contract
     */
    postContractsMulticallContract: (data: MultipleCallContract, params: RequestParams = {}) =>
      this.request<
        MultipleCallContractResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/contracts/multicall-contract`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsAddressParent
     * @summary Get parent contract address
     * @request GET:/contracts/{address}/parent
     */
    getContractsAddressParent: (address: string, params: RequestParams = {}) =>
      this.request<string, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${address}/parent`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsAddressSubContracts
     * @summary Get sub-contract addresses
     * @request GET:/contracts/{address}/sub-contracts
     */
    getContractsAddressSubContracts: (
      address: string,
      query: {
        /** @format int32 */
        start: number
        /** @format int32 */
        limit?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<SubContracts, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${address}/sub-contracts`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name GetContractsAddressSubContractsCurrentCount
     * @summary Get current value of the sub-contracts counter for a contract
     * @request GET:/contracts/{address}/sub-contracts/current-count
     */
    getContractsAddressSubContractsCurrentCount: (address: string, params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/contracts/${address}/sub-contracts/current-count`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Contracts
     * @name PostContractsCallTxScript
     * @summary Call TxScript
     * @request POST:/contracts/call-tx-script
     */
    postContractsCallTxScript: (data: CallTxScript, params: RequestParams = {}) =>
      this.request<CallTxScriptResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>(
        {
          path: `/contracts/call-tx-script`,
          method: 'POST',
          body: data,
          type: ContentType.Json,
          format: 'json',
          ...params
        }
      ).then(convertHttpResponse)
  }
  multisig = {
    /**
     * No description
     *
     * @tags Multi-signature
     * @name PostMultisigAddress
     * @summary Create the multisig address and unlock script
     * @request POST:/multisig/address
     */
    postMultisigAddress: (data: BuildMultisigAddress, params: RequestParams = {}) =>
      this.request<
        BuildMultisigAddressResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/multisig/address`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Multi-signature
     * @name PostMultisigBuild
     * @summary Build a multisig unsigned transaction
     * @request POST:/multisig/build
     */
    postMultisigBuild: (data: BuildMultisig, params: RequestParams = {}) =>
      this.request<
        BuildTransferTxResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/multisig/build`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Multi-signature
     * @name PostMultisigSweep
     * @summary Sweep all unlocked ALPH and token balances of a multisig address to another address
     * @request POST:/multisig/sweep
     */
    postMultisigSweep: (data: BuildSweepMultisig, params: RequestParams = {}) =>
      this.request<
        BuildSweepAddressTransactionsResult,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/multisig/sweep`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Multi-signature
     * @name PostMultisigSubmit
     * @summary Submit a multi-signed transaction
     * @request POST:/multisig/submit
     */
    postMultisigSubmit: (data: SubmitMultisig, params: RequestParams = {}) =>
      this.request<SubmitTxResult, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/multisig/submit`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  miners = {
    /**
     * No description
     *
     * @tags Miners
     * @name PostMinersCpuMining
     * @summary Execute an action on CPU miner. !!! for test only !!!
     * @request POST:/miners/cpu-mining
     */
    postMinersCpuMining: (
      query: {
        action: string
      },
      params: RequestParams = {}
    ) =>
      this.request<boolean, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/cpu-mining`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Miners
     * @name PostMinersCpuMiningMineOneBlock
     * @summary Mine a block on CPU miner. !!! for test only !!!
     * @request POST:/miners/cpu-mining/mine-one-block
     */
    postMinersCpuMiningMineOneBlock: (
      query: {
        /** @format int32 */
        fromGroup: number
        /** @format int32 */
        toGroup: number
      },
      params: RequestParams = {}
    ) =>
      this.request<boolean, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/cpu-mining/mine-one-block`,
        method: 'POST',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Miners
     * @name GetMinersAddresses
     * @summary List miner's addresses
     * @request GET:/miners/addresses
     */
    getMinersAddresses: (params: RequestParams = {}) =>
      this.request<MinerAddresses, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/addresses`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Miners
     * @name PutMinersAddresses
     * @summary Update miner's addresses, but better to use user.conf instead
     * @request PUT:/miners/addresses
     */
    putMinersAddresses: (data: MinerAddresses, params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/miners/addresses`,
        method: 'PUT',
        body: data,
        type: ContentType.Json,
        ...params
      }).then(convertHttpResponse)
  }
  events = {
    /**
     * No description
     *
     * @tags Events
     * @name GetEventsContractContractaddress
     * @summary Get events for a contract within a counter range
     * @request GET:/events/contract/{contractAddress}
     */
    getEventsContractContractaddress: (
      contractAddress: string,
      query: {
        /** @format int32 */
        start: number
        /** @format int32 */
        limit?: number
        /** @format int32 */
        group?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<ContractEvents, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/events/contract/${contractAddress}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Events
     * @name GetEventsContractContractaddressCurrentCount
     * @summary Get current value of the events counter for a contract
     * @request GET:/events/contract/{contractAddress}/current-count
     */
    getEventsContractContractaddressCurrentCount: (contractAddress: string, params: RequestParams = {}) =>
      this.request<number, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/events/contract/${contractAddress}/current-count`,
        method: 'GET',
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Events
     * @name GetEventsTxIdTxid
     * @summary Get contract events for a transaction
     * @request GET:/events/tx-id/{txId}
     */
    getEventsTxIdTxid: (
      txId: string,
      query?: {
        /** @format int32 */
        group?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<
        ContractEventsByTxId,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/events/tx-id/${txId}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Events
     * @name GetEventsBlockHashBlockhash
     * @summary Get contract events for a block
     * @request GET:/events/block-hash/{blockHash}
     */
    getEventsBlockHashBlockhash: (
      blockHash: string,
      query?: {
        /** @format int32 */
        group?: number
      },
      params: RequestParams = {}
    ) =>
      this.request<
        ContractEventsByBlockHash,
        BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable
      >({
        path: `/events/block-hash/${blockHash}`,
        method: 'GET',
        query: query,
        format: 'json',
        ...params
      }).then(convertHttpResponse)
  }
  utils = {
    /**
     * No description
     *
     * @tags Utils
     * @name PostUtilsVerifySignature
     * @summary Verify the SecP256K1 signature of some data
     * @request POST:/utils/verify-signature
     */
    postUtilsVerifySignature: (data: VerifySignature, params: RequestParams = {}) =>
      this.request<boolean, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/verify-signature`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Utils
     * @name PostUtilsTargetToHashrate
     * @summary Convert a target to hashrate
     * @request POST:/utils/target-to-hashrate
     */
    postUtilsTargetToHashrate: (data: TargetToHashrate, params: RequestParams = {}) =>
      this.request<Result, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/target-to-hashrate`,
        method: 'POST',
        body: data,
        type: ContentType.Json,
        format: 'json',
        ...params
      }).then(convertHttpResponse),

    /**
     * No description
     *
     * @tags Utils
     * @name PutUtilsCheckHashIndexing
     * @summary Check and repair the indexing of block hashes
     * @request PUT:/utils/check-hash-indexing
     */
    putUtilsCheckHashIndexing: (params: RequestParams = {}) =>
      this.request<void, BadRequest | Unauthorized | NotFound | InternalServerError | ServiceUnavailable>({
        path: `/utils/check-hash-indexing`,
        method: 'PUT',
        ...params
      }).then(convertHttpResponse)
  }
}

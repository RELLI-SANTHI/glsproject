export interface AgencyOption {
  id: number;
  name: string | null | undefined;
}

export interface AgentDTO {
  companyName: string;
  agentCode: number;
  vatNumber: string;
  fiscalCode: string;
}

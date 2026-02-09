
export interface Event {
    id: number;
    title: string;
    description: string;
    address: string;
    startDate: string;
    endDate: string;
    capacity: number;
    status: 'DRAFT' | 'PUBLISHED' | 'CANCELED';
    image?: string;
}

export interface CreateEventDto {
    title: string;
    description: string;
    address: string;
    startDate: string;
    endDate: string;
    capacity: number;
    status?: 'DRAFT' | 'PUBLISHED' | 'CANCELED';
    image?: string;
}

export interface UpdateEventDto extends Partial<CreateEventDto> {
    id: number;
}

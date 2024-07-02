export interface IDFDElement {
    id: string;
    value: string | null;
    type: string | null;
    style: string | null;
    edge: string | null;
    vertex: string | null;
    parent: string | null;
    source: string | null;
    target: string | null;
    geometry: {
        width: string | null;
        height: string | null;
        x: string | null;
        y: string | null;
        sourcepoint: {
            x: string;
            y: string;
        } | null;
        targetpoint: {
            x: string;
            y: string;
        } | null;
        points: Array<{
            x: string;
            y: string;
        }>;
    } | null;
}

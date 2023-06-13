
export class ObjectPool2<T>
{
    public debugLogEnabled: boolean = false;
    public useLogInsteadOfWarning: boolean = false;

    public employed: Array<T> = [];
    public unemployed: Array<T>;

    private constructorMethod: (poolID: string) => T;
    private recyclerMethod: (instance: T) => void;
    private expandRate: number;
    private autoExpand: boolean;
    private poolID: string;
    private _totalCreated: number = 0;

    constructor(options: IObjectPoolConfigOptions<T>)
    {
        var constructorMethod = options.constructorMethod;
        var recyclerMethod = options.hasOwnProperty("recyclerMethod") ? options.recyclerMethod : null;
        var initialSize = options.hasOwnProperty("initialSize") ? options.initialSize : 0;
        var autoExpand = options.hasOwnProperty("autoExpand") ? options.autoExpand : true;
        var expandRate = options.hasOwnProperty("expandRate") ? options.expandRate : 1;
        var poolID = options.hasOwnProperty("poolID") ? options.poolID : "default_pool_id";

        this.unemployed = new Array();
        this.constructorMethod = constructorMethod;
        this.recyclerMethod = recyclerMethod;
        this.autoExpand = autoExpand;
        this.expandRate = expandRate;
        this.poolID = poolID;

        if (initialSize > 0) this.expandPool(initialSize);
    }

    private fastSplice<T>(array: Array<T>, startIndex: number, removeCount: number = 1): T
    {
        var element: T = array[startIndex];
        for (let i = startIndex; i < array.length; i++)
        {
            array[i] = array[i + removeCount];
        }

        array.length -= removeCount;

        return element
    }

    /***********************************
     * PUBLIC API 
     */

    public expandPool(amount: number): void
    {
        for (var i: number = 0; i < amount; i++)
        {
            this.unemployed.push(this.constructorMethod(this.poolID));

            this._totalCreated++;
            //dispatch signal on new object creation
            // onObjectCreated.dispatch();
        }
    }

    public getInstance(): T
    {
        var instance: T = this.unemployed.shift();

        if ((!instance) && (this.autoExpand == true))
        {
            if (this.autoExpand == true)
            {
                this.expandPool(this.expandRate);

                instance = this.unemployed.shift();

                this.log();
            }

        }

        this.employed.push(instance);

        return instance;
    }

    public returnInstance(instance: T): void
    {
        //check if emplyed previously
        var index = this.employed.indexOf(instance);

        if (index < 0)
        {
            console.error("Instance not employed by this pool");
            return
        }
        else
        {
            this.fastSplice(this.employed, index);

            if (this.recyclerMethod)
                this.recyclerMethod(instance);

            this.unemployed.push(instance);
        }



    }

    public recycleAllEmployed = () =>
    {
        //traverse backwards - array length suffers changes
        for (var i = this.employed.length - 1; i > -1; i--)
            this.returnInstance(this.employed[i]);
    }

    private log = () =>
    {
        if (!this.debugLogEnabled)
            return

        if (!this.useLogInsteadOfWarning)
            //warn that the pool is empty and new instances will be created
            console.warn("The pool for type - '" + this.poolID + "' is empty. Expanding by amount (" + this.expandRate + "). " + "Current pool size: " + this._totalCreated);
        else
            console.log("[~~~] Pool - '" + this.poolID + "' is empty. Expanding by amount (" + this.expandRate + "). " + "New size: " + this._totalCreated);
    }

    public get size(): number { return this.unemployed.length; }
    public get totalCreated(): number { return this._totalCreated }


}

export interface IObjectPoolConfigOptions<T>
{
    constructorMethod: (poolID: string) => T,
    recyclerMethod?: (instance: T) => void,
    initialSize?: number;
    autoExpand?: boolean;
    expandRate?: number;
    poolID?: string;
}


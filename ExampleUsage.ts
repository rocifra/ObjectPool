import { BoxGeometry, Mesh } from "three";
import { ObjectPool2 } from "./sb/data/ObjectPool2";


//pooling a couple of threeJs meshes 
var meshPool = new ObjectPool2<Mesh>({
    autoExpand: true, //expands the pool automatically when pool is empty - default true
    expandRate: 1, //how many extra object instances should be created when pool needs expanding - default 1
    initialSize: 100,  //how many instances of the object should be created initially when the pool is initialized
    poolID: "my_mesh_pool", //just a string tag to keep for identifying the pool type later
    constructorMethod: meshConstructor, //this is called when new objects need to be contructed
    recyclerMethod: meshRecycler //this is called when you return objects back to the pool
})

function meshConstructor(): Mesh
{
    return new Mesh(new BoxGeometry(1, 1, 1));
}

function meshRecycler(object: Mesh)
{
    // reset position  
    object.position.set(0, 0, 0);

    //reset rotation
    object.rotation.set(0, 0, 0);

    //.... reset other stuff as needed
}
//end pool setup

//now we can get an object from the pool (in this case a three Mesh) and we start using it by adding it to some scene
var mesh = meshPool.getInstance();

mesh.position.set(5, 10, 5);
mesh.rotation.set(Math.PI / 2, 0, 0);

//example only
//scene.add(mesh)

//when we are done with the mesh we must return it to the pool
meshPool.returnInstance(mesh) //at this point "recycler" method will be called on the mesh in order to reset it's props to default

//the pool keeps track of all objects it has in care grouped by their current state:
// - employed (objects currently in use - live objects that have been "borrowed from the pool")
// - unemployed ( free remaining objects in the pool ready to be used )


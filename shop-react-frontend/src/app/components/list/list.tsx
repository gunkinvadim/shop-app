import { environment } from "../../../environments/environment";
import "./list.scss"

export const List = () => {

    const getList = async () => {
        try {
            const res = await fetch(environment.baseUrl + "/list", {
                headers: { 'Content-Type': 'application/json' },
            });
            console.log(await res.json());
        }
        catch(err) {
            console.error(err);
        }
    };

    const addItem = async (name: string) => {
        try {
            const res = await fetch(environment.baseUrl + "/list", {
                method: "POST",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name })
            });
            console.log(await res.json());
        }
        catch(err) {
            console.error(err);
        }
    };

    const editItem = async (id: number, name: string) => {
        try {
            const res = await fetch(environment.baseUrl + "/list/" + id, {
                method: "PUT",
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: name })
            });
            console.log(await res.json());
        }
        catch(err) {
            console.error(err);
        }
    }

    const deleteItem = async (id: number) => {
        try {
            const res = await fetch(environment.baseUrl + "/list/" + id, {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' }
            });
            console.log(await res.json());
        }
        catch(err) {
            console.error(err);
        }
    }

    return <div>
        This page is just fot testing API
        <div className="test-buttons">
            <button
                className='button'
                onClick={getList}
            >
                Get List
            </button>
            <button
                className='button'
                onClick={() => addItem("jack")}
            >
                Add Item to List
            </button>
            <button
                className='button'
                onClick={() => editItem(2, "mike")}
            >
                Edit second
            </button>
            <button
                className='button'
                onClick={() => deleteItem(3)}
            >
                Delete third
            </button>
        </div>
    </div>
}
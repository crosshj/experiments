prism = prism || console.info;

console.info(`
You are given a list of jobs to be done, where each job is represented by a start time and end time. Two jobs are compatible if they don't overlap. Find the largest subset of compatible jobs.

For example, given the following jobs (there is no guarantee that jobs will be sorted):

[[0, 6],
[1, 4],
[3, 5],
[3, 8],
[4, 7],
[5, 9],
[6, 10],
[8, 11]]

Return:

[[1, 4],
[4, 7],
[8, 11]]
`.trim())

/*
// what I'd really like to do:
function maxCompat(input){
    const graph = input
        .toGraph(([a, b], [a2, b2]) => b <= a2);
    return graph
        .flatten()
        .max(x => x.length);
}
*/

const input = [[0, 6], [1, 4], [3, 5], [3, 8], [4, 7], [5, 9], [6, 10], [8, 11]];

function maxCompat(input) {
    const intersect = (a1, a2, r) =>
        a1[0] === a2[0] ||
        a1[1] === a2[1] ||
        (a1[0] < a2[1] && a1[0] > a2[0]) ||
        (a1[1] < a2[1] && a1[1] > a2[0]) ||
        (!r && intersect(a2, a1, true));
    const noInt = input.map(x => input.filter(y => !intersect(x, y)));
    const friend = input
        .map(x => noInt
            .map((y, i) => y
                .some(z => z[0] === x[0] && z[1] === x[1]) ? i : null)
            .filter(q => q !== null));
    return input
        .map((x, i) => ({
            self: x,
            friends: friend[i]
         }))
        .sort((a, b) => b.friends.length - a.friends.length)
        .reduce((all, one) => {
            if (!all.some(x => intersect(x, one.self))) {
                all.push(one.self);
            }
            return all;
        }, [])
        .sort((a, b) => a[0] - b[0]);
}

const graphFrame = document.createElement('iframe');
graphFrame.src = 'golf1.graph.json/::preview::/';
graphFrame.style.width = 'calc(100% + 10px)';
graphFrame.style.marginLeft = '-5px';
graphFrame.height = '450px';
graphFrame.style.border = 'none';
graphFrame.style.marginTop = '-25px';
document.body.appendChild(graphFrame)


prism('javascript', maxCompat.toString())

console.info(`INPUT:\n\t[  [${input.join('],  [')}]  ]`);
console.info('ANSWER:\n\t[  [' + maxCompat(input).join('],  [') + ']  ]');

use v6;

sub fibonacci (Int $n where 0..*) {
    if $n == 0 | 1 {
        return 1;
    }
    else {
        return fibonacci($n-1) + fibonacci($n-2);
    }
}

for 0..9 -> $i {
    say fibonacci($i);
}

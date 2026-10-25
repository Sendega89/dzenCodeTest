(module
  (memory (export "memory") 1)
  (func (export "sum") (param $ptr i32) (param $len i32) (result i32)
    (local $i i32)
    (local $acc i32)
    (loop $loop
      (if (i32.lt_u (local.get $i) (local.get $len))
        (then
          (local.set $acc
            (i32.add
              (local.get $acc)
              (i32.load (i32.add (local.get $ptr) (i32.shl (local.get $i) (i32.const 2))))))
          (local.set $i (i32.add (local.get $i) (i32.const 1)))
          (br $loop))))
    (local.get $acc)))
